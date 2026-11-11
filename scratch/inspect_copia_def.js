const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const target = 'id="contenedor-comprobante-copia"';
const idx = html.indexOf(target);
console.log('Index of copia:', idx);
console.log(html.substring(idx - 100, idx + 800));
