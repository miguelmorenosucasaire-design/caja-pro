const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="modal-nuevo-movimiento"');
console.log(html.substring(idx + 16000, idx + 20000));
