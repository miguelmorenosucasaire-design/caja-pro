const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const s = html.indexOf('id="contenedor-comprobante-oficial"');
const e = html.indexOf('id="separador-corte-talonario"');
const snippet = html.substring(s, e);
const lines = snippet.split('\n');

for (let i = 25; i <= 75; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
