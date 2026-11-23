const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalConMovimiento');
const sub = html.substring(idx, idx + 2500);
const pos = sub.indexOf('form-metodo');
console.log(sub.substring(pos, pos + 400));
