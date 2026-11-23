const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('id="modal-ficha-estudiante"');
console.log(html.substring(idx + 6500, idx + 9000));
