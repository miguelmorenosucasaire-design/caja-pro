const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="modal-nuevo-movimiento"');
console.log(html.substring(idx + 4000, idx + 8000));
