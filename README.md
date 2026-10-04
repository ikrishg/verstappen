# Verstappen

Download images from a URL, optimize them with [sharp](https://sharp.pixelplumbing.com/), and either save to disk or get a `Buffer` back.

**Verstappen** is the GitHub project name ([`ikrishg/verstappen`](https://github.com/ikrishg/verstappen), formerly `azelf`). The npm package is still [`azelf`](https://www.npmjs.com/package/azelf); the public API export is `azelf` until an npm rename is decided separately.

## Install

From npm:

```bash
npm install azelf
```

From this repository (after clone):

```bash
git clone https://github.com/ikrishg/verstappen.git
cd verstappen
yarn install
yarn build
```

## Usage (npm)

```js
const path = require('path')
const { azelf } = require('azelf')

;(async () => {
  await azelf('https://example.com/photo.jpg', 'photo.webp', {
    quality: 80,
    webp: true,
    directory: path.join(__dirname, 'images')
  })
})().catch(console.error)
```

Creates `images/photo.webp` (and creates `directory` if it is missing).

### Return a buffer

```js
const { azelf } = require('azelf')

;(async () => {
  const buffer = await azelf(
    'https://example.com/photo.jpg',
    'photo.webp',
    {
      quality: 80,
      webp: true,
      output: 'buffer'
    }
  )
  console.log(buffer.length)
})().catch(console.error)
```

### Options

| Option | Default | Description |
| --- | --- | --- |
| `quality` | `80` | Compression quality (1–100) for webp/jpeg/png output |
| `webp` | `true` | Convert to WebP; when `false`, format follows `name` extension |
| `directory` | `process.cwd()` | Output folder when `output` is `'file'` |
| `output` | `'file'` | `'file'` writes to disk; `'buffer'` returns a `Buffer` |

## Usage (this repo, before publish)

After `yarn build`, load the compiled entry from the repo root:

```js
const { azelf } = require('./dist')
```

See `examples/index.js`.

## Development

```bash
yarn install
yarn build
node examples/index.js
```

## Support

- [GitHub Discussions](https://github.com/ikrishg/verstappen/discussions)
- [Issues](https://github.com/ikrishg/verstappen/issues)
