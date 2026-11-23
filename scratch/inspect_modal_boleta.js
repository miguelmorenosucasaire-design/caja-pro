const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = html.indexOf('id="contenedor-boleta-modal-costado"');
console.log(html.substring(startIdx, startIdx + 2000));
