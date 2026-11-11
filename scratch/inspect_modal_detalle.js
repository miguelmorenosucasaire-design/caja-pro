const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function abrirModalDetalleGrupo');
if (idx > -1) {
    console.log(html.substring(idx, idx + 2500));
} else {
    console.log('abrirModalDetalleGrupo not found');
}
