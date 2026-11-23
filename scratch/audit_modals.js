const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const hasModalMov = html.includes('id="modal-nuevo-movimiento"');
const hasModalEst = html.includes('id="modal-nuevo-estudiante"');
console.log('modal-nuevo-movimiento exists:', hasModalMov);
console.log('modal-nuevo-estudiante exists:', hasModalEst);

if (hasModalMov) {
    const idx = html.indexOf('id="modal-nuevo-movimiento"');
    console.log('--- modal-nuevo-movimiento snippet ---');
    console.log(html.slice(idx, idx + 1200));
}

if (hasModalEst) {
    const idx2 = html.indexOf('id="modal-nuevo-estudiante"');
    console.log('--- modal-nuevo-estudiante snippet ---');
    console.log(html.slice(idx2, idx2 + 1200));
}
