const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

function checkVoucherEnd(id) {
  const start = html.indexOf(`id="${id}"`);
  const chunk = html.substring(start, start + 3500);
  console.log(`=== ${id} END ===`);
  const lines = chunk.split('\n');
  for (let i = 40; i < Math.min(lines.length, 95); i++) {
    const l = lines[i];
    console.log(`${i+1}: ${l}`);
  }
}

checkVoucherEnd('contenedor-comprobante-oficial');
checkVoucherEnd('contenedor-comprobante-copia');
