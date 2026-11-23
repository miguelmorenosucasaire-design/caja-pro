const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('recibo__tarjeta') || l.includes('recibo__caja') || l.includes('recibo__pie') || l.includes('voucher-media-carta')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
