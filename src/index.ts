import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { Readable, Transform } from 'node:stream'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'
import Trevenant from 'trevenant'

/** Maximum download size when Content-Length is absent (50 MiB). */
const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024

export interface AzelfOptions {
  quality?: number
  webp?: boolean
  directory?: string
  output?: 'file' | 'buffer'
}

const defaultOptions: Required<
  Pick<AzelfOptions, 'quality' | 'webp' | 'output' | 'directory'>
> = {
  quality: 80,
  webp: true,
  output: 'file',
  directory: process.cwd()
}

async function cancelResponseBody (
  response: Response
): Promise<void> {
  if (response.body !== null) {
    await response.body.cancel()
  }
}

function limitDownloadSize (
  source: Readable,
  maxBytes: number
): Readable {
  let total = 0
  const limiter = new Transform({
    transform (chunk: Buffer, _encoding, callback) {
      total += chunk.length
      if (total > maxBytes) {
        callback(
          new Error(`Download exceeded size limit of ${maxBytes} bytes`)
        )
        source.destroy()
        return
      }
      callback(null, chunk)
    }
  })
  return source.pipe(limiter)
}

async function openDownloadStream (
  url: string,
  maxBytes: number = MAX_DOWNLOAD_BYTES
): Promise<Readable> {
  const response = await fetch(url)
  if (!response.ok) {
    await cancelResponseBody(response)
    throw new Error(
      `Failed to download image from ${url}: ${response.status} ${response.statusText}`
    )
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength !== null) {
    const length = Number(contentLength)
    if (Number.isFinite(length) && length > maxBytes) {
      await cancelResponseBody(response)
      throw new Error(
        `Download Content-Length (${length}) exceeds limit of ${maxBytes} bytes`
      )
    }
  }

  if (response.body === null) {
    throw new Error(`No response body when downloading ${url}`)
  }

  const nodeStream = Readable.fromWeb(
    response.body as WebReadableStream<Uint8Array>
  )
  return limitDownloadSize(nodeStream, maxBytes)
}

function buildPipeline (
  input: Readable,
  name: string,
  options: Required<Pick<AzelfOptions, 'quality' | 'webp'>>
): sharp.Sharp {
  let pipeline = sharp()

  if (options.webp) {
    pipeline = pipeline.webp({ quality: options.quality })
  } else {
    const ext = path.extname(name).toLowerCase()
    if (ext === '.png') {
      pipeline = pipeline.png({ quality: options.quality })
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: options.quality })
    } else {
      pipeline = pipeline.jpeg({ quality: options.quality })
    }
  }

  input.pipe(pipeline)
  return pipeline
}

export async function azelf (
  url: string,
  name: string,
  options?: AzelfOptions & { output?: 'file' }
): Promise<void>
export async function azelf (
  url: string,
  name: string,
  options: AzelfOptions & { output: 'buffer' }
): Promise<Buffer>
export async function azelf (
  url: string,
  name: string,
  options?: AzelfOptions
): Promise<void | Buffer>
export async function azelf (
  url: string,
  name: string,
  options: AzelfOptions = {}
): Promise<void | Buffer> {
  const trevenant = new Trevenant()
  const resolved: Required<
    Pick<AzelfOptions, 'quality' | 'webp' | 'output' | 'directory'>
  > = {
    quality: options.quality ?? defaultOptions.quality,
    webp: options.webp ?? defaultOptions.webp,
    output: options.output ?? defaultOptions.output,
    directory: options.directory ?? defaultOptions.directory
  }

  if (resolved.output === 'file') {
    const directory = path.resolve(resolved.directory)
    trevenant.debug(`Directory set to: ${directory}`)

    if (!fs.existsSync(directory)) {
      trevenant.info(`Directory ${directory} does not exist, creating it.`)
      fs.mkdirSync(directory, { recursive: true })
      trevenant.debug(`Directory ${directory} created.`)
    }
  }

  try {
    trevenant.info(`Downloading image from ${url}`)
    trevenant.debug(`Compression with ${resolved.quality}% quality`)

    const downloadStream = await openDownloadStream(url)
    const image = buildPipeline(downloadStream, name, resolved)

    if (resolved.webp) {
      trevenant.info('Converting image to webp')
    }

    if (resolved.output === 'buffer') {
      trevenant.debug('Returning optimized image as buffer')
      const buffer = await image.toBuffer()
      trevenant.success('Image optimized in memory')
      return buffer
    }

    const directory = path.resolve(resolved.directory)
    const filePath = path.join(directory, name)
    trevenant.debug(`Saving image to ${filePath}`)
    await image.toFile(filePath)
    trevenant.success(`Image saved to ${filePath}`)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error)
    trevenant.error(new Error(message))
    throw error instanceof Error ? error : new Error(message)
  }
}

export default azelf

/** @deprecated Use {@link AzelfOptions} */
export type VerstappenOptions = AzelfOptions
