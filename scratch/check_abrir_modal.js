const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('function abrirModalNuevoMovimiento');
console.log('abrirModalNuevoMovimiento at', idx);
console.log(html.slice(idx, idx + 1800));
