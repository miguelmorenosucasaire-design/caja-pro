const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalDetalleGrupo');
console.log(html.substring(idx - 30, idx + 100));
