const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('id="contenedor-boleta-modal-costado"');
console.log(html.substring(idx - 100, idx + 600));
