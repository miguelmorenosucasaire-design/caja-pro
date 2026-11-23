const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

function extractFn(fnName) {
  const idx = html.indexOf('function ' + fnName);
  if (idx === -1) return null;
  return html.substring(idx, idx + 2500);
}

console.log('--- exportarFacturaPDF ---');
console.log(extractFn('exportarFacturaPDF'));

console.log('--- descargarBoletaModalDirecta ---');
console.log(extractFn('descargarBoletaModalDirecta'));
