const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = html.indexOf('<div id="contenedor-comprobante-oficial"');
console.log(html.substring(startIdx, startIdx + 2000));
