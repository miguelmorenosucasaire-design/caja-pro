const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('function abrirModalNuevoMovimiento(');
if (idx === -1) idx = html.indexOf('function abrirModalNuevoMovimiento()');
console.log('Index:', idx);
console.log(html.substring(idx, idx + 800));
