const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('id="modal-nuevo-movimiento"');
console.log(html.slice(idx + 5500, idx + 9500));
