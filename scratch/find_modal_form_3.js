const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="modal-nuevo-movimiento"');
console.log(html.substring(idx + 8000, idx + 12000));
