const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

function checkVoucher(id) {
  const start = html.indexOf(`id="${id}"`);
  const chunk = html.substring(start, start + 3500);
  console.log(`=== ${id} ===`);
  const lines = chunk.split('\n');
  for (let i = 0; i < Math.min(lines.length, 90); i++) {
    const l = lines[i];
    if (l.includes('<div') || l.includes('</div') || l.includes('<footer') || l.includes('</footer') || l.includes('recibo__')) {
      console.log(`${i+1}: ${l.trim()}`);
    }
  }
}

checkVoucher('contenedor-comprobante-oficial');
checkVoucher('contenedor-comprobante-copia');
