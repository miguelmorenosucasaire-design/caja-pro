const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /\.recibo__cab[\s\S]*?\{[\s\S]*?\}/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[0]);
}

const idx = html.indexOf('.recibo__cab');
console.log('--- CSS around .recibo__cab ---');
console.log(html.substring(idx - 100, idx + 1000));
