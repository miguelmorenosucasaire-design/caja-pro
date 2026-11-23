const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="modal-nuevo-movimiento"');
console.log(html.substring(idx + 12000, idx + 16000));
