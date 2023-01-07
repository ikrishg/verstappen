const { azelf } = require('../');
const path = require('path');

azelf('https://github.com/krshkun.png', 'github.webp', {
  directory: path.join(__dirname, 'images'),
  quality: 2,
  webp: true
})
