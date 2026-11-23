const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const s1 = html.indexOf('id="contenedor-comprobante-oficial"');
const e1 = html.indexOf('id="separador-corte-talonario"');
const lines1 = html.substring(s1, e1).split('\n');

const s2 = html.indexOf('id="contenedor-comprobante-copia"');
const e2 = html.indexOf('id="contenedor-previsualizador-pdf"');
const lines2 = html.substring(s2, e2).split('\n');

console.log('Lines in V1:', lines1.length, 'Lines in V2:', lines2.length);

for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
  const l1 = (lines1[i] || '').trim();
  const l2 = (lines2[i] || '').trim();
  // Strip ids and prefixes
  const c1 = l1.replace(/id="[^"]*"/g, '').replace(/onclick="[^"]*"/g, '');
  const c2 = l2.replace(/id="[^"]*"/g, '').replace(/onclick="[^"]*"/g, '');
  if (c1 !== c2) {
    console.log(`Line ${i}:`);
    console.log('  V1:', l1);
    console.log('  V2:', l2);
  }
}
