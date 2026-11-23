const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const cssIdx = html.indexOf('.generando-pdf-oficial');
console.log('--- CSS Snippet ---');
console.log(html.substring(cssIdx, cssIdx + 300));

const fnIdx = html.indexOf('function descargarBoletaModalDirecta');
console.log('--- Fn Snippet ---');
console.log(html.substring(fnIdx - 10, fnIdx + 400));
