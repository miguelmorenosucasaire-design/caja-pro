const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = html.indexOf('<div id="contenedor-comprobante-oficial"');
const endMarker = '<!-- COLUMNA LATERAL (xl:col-span-4): SECCIÓN AHÍ MISMO PARA EDITAR NOTAS -->';
const endIdx = html.indexOf(endMarker, startIdx);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);
console.log(html.substring(endIdx - 200, endIdx));
