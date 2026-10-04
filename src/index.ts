import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import Trevenant from 'trevenant'

export interface VerstappenOptions {
  quality?: number
  webp?: boolean
  directory?: string
  output?: 'file' | 'buffer'
}

const defaultOptions: Required<
  Pick<VerstappenOptions, 'quality' | 'webp' | 'output' | 'directory'>
> = {
  quality: 80,
  webp: true,
  output: 'file',
  directory: process.cwd()
}

async function downloadImage (url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to download image from ${url}: ${response.status} ${response.statusText}`
    )
  }
  return Buffer.from(await response.arrayBuffer())
}

function buildPipeline (
  input: Buffer,
  name: string,
  options: Required<Pick<VerstappenOptions, 'quality' | 'webp'>>
): sharp.Sharp {
  const pipeline = sharp(input)

  if (options.webp) {
    return pipeline.webp({ quality: options.quality })
  }

  const ext = path.extname(name).toLowerCase()
  if (ext === '.png') {
    return pipeline.png({ quality: options.quality })
  }
  if (ext === '.webp') {
    return pipeline.webp({ quality: options.quality })
  }

  return pipeline.jpeg({ quality: options.quality })
}

export async function verstappen (
  url: string,
  name: string,
  options?: VerstappenOptions & { output?: 'file' }
): Promise<void>
export async function verstappen (
  url: string,
  name: string,
  options: VerstappenOptions & { output: 'buffer' }
): Promise<Buffer>
export async function verstappen (
  url: string,
  name: string,
  options: VerstappenOptions = {}
): Promise<void | Buffer> {
  const trevenant = new Trevenant()
  const resolved: Required<
    Pick<VerstappenOptions, 'quality' | 'webp' | 'output' | 'directory'>
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

    const input = await downloadImage(url)
    let image = buildPipeline(input, name, resolved)

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

export default verstappen
