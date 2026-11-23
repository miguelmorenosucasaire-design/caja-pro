const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalConMovimiento');
console.log(html.substring(idx + 1000, idx + 2400));
