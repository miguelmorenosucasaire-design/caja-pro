const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const targets = ['id="modal-agregar-movimiento"', 'id="modal-nuevo-estudiante"', 'id="modal-'];
targets.forEach(t => {
    let idx = 0;
    while((idx = html.indexOf(t, idx)) !== -1) {
        console.log(t, 'at', idx);
        idx += 20;
    }
});
