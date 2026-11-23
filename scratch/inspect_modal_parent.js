const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /<div[^>]*id="contenedor-boleta-modal-costado"[^>]*>/;
console.log(html.match(regex)[0]);

// Find parent classes as well
const idx = html.indexOf('id="contenedor-boleta-modal-costado"');
console.log(html.substring(idx - 400, idx + 100));
