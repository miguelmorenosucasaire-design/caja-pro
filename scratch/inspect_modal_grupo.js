const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('function abrirModalNuevoGrupo');
console.log('abrirModalNuevoGrupo found:', idx !== -1);
if (idx !== -1) {
    console.log(content.slice(idx, idx + 1500));
}

const modalIdx = content.indexOf('modal-nuevo-grupo');
console.log('modal-nuevo-grupo found:', modalIdx !== -1);
if (modalIdx !== -1) {
    console.log(content.slice(modalIdx - 50, modalIdx + 1000));
}
