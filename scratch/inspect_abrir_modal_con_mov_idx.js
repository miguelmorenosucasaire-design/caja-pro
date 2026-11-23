const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalConMovimiento');
console.log('Index:', idx);
console.log(html.substring(idx, idx + 1200));
