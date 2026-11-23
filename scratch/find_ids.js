const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const regex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = regex.exec(content)) !== null) {
  if (match[1].startsWith('factura-') || match[1].startsWith('copia-') || match[1].includes('box-mod') || match[1].includes('check-')) {
    ids.add(match[1]);
  }
}
console.log(Array.from(ids));
