const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalConMovimiento');
const nextFn = html.indexOf('function verBoletaDirecta', idx);
console.log(html.substring(idx + 1000, nextFn));
