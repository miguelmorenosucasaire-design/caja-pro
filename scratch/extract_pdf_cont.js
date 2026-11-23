const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

function extractMore(fnName) {
  const idx = html.indexOf('function ' + fnName);
  if (idx === -1) return null;
  return html.substring(idx, idx + 4000);
}

console.log('--- generarBlobPDF ---');
console.log(extractMore('generarBlobPDF'));

console.log('--- descargarBoletaModalDirecta (cont) ---');
const idx = html.indexOf('function descargarBoletaModalDirecta');
console.log(html.substring(idx + 1800, idx + 4500));
