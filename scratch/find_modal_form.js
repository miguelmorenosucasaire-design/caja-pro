const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="modal-nuevo-movimiento"');
console.log('modal-nuevo-movimiento at:', idx);
console.log(html.substring(idx, idx + 4000));
