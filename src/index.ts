import request from 'request'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import Trevenant from 'trevenant'

interface Options {
  quality: number
  webp: Boolean
  directory: string
}

const defaultOptions: Options = {
  quality: 80,
  webp: true,
  directory: process.cwd()
}

export async function azelf (
  url: string,
  name: string,
  options: Options = defaultOptions
): Promise<void> {
  const trevenant = new Trevenant()

  const directory = path.resolve(options.directory)

  trevenant.info(`Directory set to: ${directory}`)

  if (!fs.existsSync(directory)) {
    trevenant.info(`Directory ${directory} does not exist, creating it.`)
    fs.mkdirSync(directory, { recursive: true })
    trevenant.info(`Directory ${directory} created.`)
  }

  try {
    trevenant.info(`Downloading image from ${url}`)
    trevenant.info(`Compression with ${options.quality}% quality`)

    let image = request.get(url, {
      encoding: null
    }).pipe(sharp())
      .png({
        quality: options.quality
      })
      .jpeg({
        quality: options.quality
      })

    if (options.webp === true) {
      trevenant.info('Converting image to webp')
      image = image.webp({ quality: options.quality })
    }

    trevenant.info(`Saving image to ${directory}/${name}`)
    await image.toFile(`${directory}/${name}`)
    trevenant.success(`Image saved to ${directory}/${name}`)
  } catch (error) {
    const normalizedError = (typeof error === 'string')
    if (!normalizedError) {
      console.error(error)
      process.exit(0)
    } else {
      trevenant.error(new Error(error))
    }
  }
}

export default azelf
