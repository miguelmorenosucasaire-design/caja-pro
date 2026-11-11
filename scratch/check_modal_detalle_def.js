const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('abrirModalDetalleGrupo');
console.log(html.substring(idx - 20, idx + 250));
