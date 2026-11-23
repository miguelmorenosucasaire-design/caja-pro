const fs = require('fs');

// Read PNG header and IHDR to find width/height/color type
const buf = fs.readFileSync('scratch/escudo_from_download.png');
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
const bitDepth = buf.readUInt8(24);
const colorType = buf.readUInt8(25);

console.log('PNG Width:', width, 'Height:', height, 'BitDepth:', bitDepth, 'ColorType:', colorType);
// colorType 6 is RGBA (Truecolor with alpha), 2 is RGB, 0 is grayscale, 4 is grayscale with alpha, 3 is indexed
