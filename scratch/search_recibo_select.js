const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('factura-recibo-select')) {
    console.log(i + 1, l.trim());
  }
});
