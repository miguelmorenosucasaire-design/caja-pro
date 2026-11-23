const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
lines.forEach((l, idx) => {
    if (l.includes('function guardarMovimiento(') || l.includes('id="modal-nuevo-movimiento"')) {
        console.log(idx + 1, l.trim());
    }
});
