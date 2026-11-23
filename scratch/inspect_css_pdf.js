const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /\.generando-pdf-oficial[\s\S]*?\{[\s\S]*?\}/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[0]);
}

const idx = html.indexOf('.generando-pdf-oficial');
console.log('--- CSS around .generando-pdf-oficial ---');
console.log(html.substring(idx - 100, idx + 1500));
