# Verstappen

Download images from a URL, optimize them with [sharp](https://sharp.pixelplumbing.com/), and either save to disk or get a `Buffer` back.

This repository was formerly **Azelf** (`ikrishg/azelf`). The npm package [`azelf`](https://www.npmjs.com/package/azelf) is unchanged until a separate publish decision is made; install from npm with `azelf` or use this repo locally after `yarn build`.

## Install

From npm (published package name is still `azelf`):

```bash
npm install azelf
```

From this repository:

```bash
git clone https://github.com/ikrishg/verstappen.git
cd verstappen
yarn install
yarn build
```

## Usage

### Save to a file (default)

```js
const path = require('path')
const { verstappen } = require('verstappen') // or require('azelf') from npm until renamed

await verstappen('https://example.com/photo.jpg', 'photo.webp', {
  quality: 80,
  webp: true,
  directory: path.join(__dirname, 'images')
})
```

Creates `images/photo.webp` (and creates `directory` if it is missing).

### Return a buffer

Set `output: 'buffer'` to skip writing a file. The `name` still selects the output format when `webp` is `false` (via the file extension).

```js
const { verstappen } = require('verstappen')

const buffer = await verstappen(
  'https://example.com/photo.jpg',
  'photo.webp',
  {
    quality: 80,
    webp: true,
    output: 'buffer'
  }
)

// buffer is a Node.js Buffer of the optimized image
```

### Options

| Option | Default | Description |
| --- | --- | --- |
| `quality` | `80` | Compression quality (1–100) for webp/jpeg/png output |
| `webp` | `true` | Convert to WebP; when `false`, format follows `name` extension |
| `directory` | `process.cwd()` | Output folder when `output` is `'file'` |
| `output` | `'file'` | `'file'` writes to disk; `'buffer'` returns a `Buffer` |

## Development

```bash
yarn install
yarn build
node examples/index.js
```

## Support

- [GitHub Discussions](https://github.com/ikrishg/verstappen/discussions)
- [Issues](https://github.com/ikrishg/verstappen/issues)
