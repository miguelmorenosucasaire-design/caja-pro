const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

function countDivs(id) {
  const start = html.indexOf(`id="${id}"`);
  const end = html.indexOf('<!-- Metadatos de Compatibilidad', start);
  const snippet = html.substring(start, end);
  const opens = (snippet.match(/<div\b/g) || []).length;
  const closes = (snippet.match(/<\/div>/g) || []).length;
  console.log(id, 'opens:', opens, 'closes:', closes);
}
countDivs('contenedor-comprobante-oficial');
countDivs('contenedor-comprobante-copia');
