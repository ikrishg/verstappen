const { azelf } = require('../dist')
const path = require('path')

async function main () {
  await azelf('https://httpbin.org/image/png', 'sample.webp', {
    directory: path.join(__dirname, 'images'),
    quality: 80,
    webp: true
  })

  const buffer = await azelf('https://httpbin.org/image/png', 'sample.webp', {
    quality: 80,
    webp: true,
    output: 'buffer'
  })

  console.log('File example done; buffer length:', buffer.length)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
