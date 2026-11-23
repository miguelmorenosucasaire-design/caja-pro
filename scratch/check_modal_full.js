const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="modal-nuevo-movimiento"');
const end = html.indexOf('<!-- ========================================================================= -->\n    <!-- MODAL: REGISTRAR', start + 100);
console.log('start:', start, 'end:', end);
console.log('Lines count:', html.slice(start, start + 3000));
