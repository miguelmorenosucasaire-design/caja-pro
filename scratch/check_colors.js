const fs = require('fs');
const zlib = require('zlib');

// Let's decode raw IDAT from the PNG
const buf = fs.readFileSync('scratch/escudo_from_download.png');
let pos = 8;
const idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') {
    idatChunks.push(buf.subarray(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}

const idatData = Buffer.concat(idatChunks);
const raw = zlib.inflateSync(idatData);
console.log('Decompressed length:', raw.length);

// Check RGB channels
let maxR = 0, maxG = 0, maxB = 0;
let hasRedYellow = false;
const width = 324;
const height = 396;
const rowSize = 1 + width * 3;

for (let y = 0; y < height; y++) {
  const rowStart = y * rowSize + 1;
  for (let x = 0; x < width; x++) {
    const r = raw[rowStart + x * 3];
    const g = raw[rowStart + x * 3 + 1];
    const b = raw[rowStart + x * 3 + 2];
    if (r > 200 && g < 100 && b < 100) hasRedYellow = true; // Bright red
    if (r > 200 && g > 200 && b < 100) hasRedYellow = true; // Bright yellow
  }
}

console.log('Has red/yellow colors (full color badge)?', hasRedYellow);
