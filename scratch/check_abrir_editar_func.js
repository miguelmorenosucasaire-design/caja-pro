const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('function abrirModalEditarGrupo');
console.log('abrirModalEditarGrupo exists:', idx !== -1);
if (idx !== -1) {
    console.log(content.slice(idx, idx + 1000));
}
