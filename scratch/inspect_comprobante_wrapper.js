const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = html.indexOf('<div id="contenedor-comprobante-oficial"');
console.log('startIdx:', startIdx);
if (startIdx !== -1) {
    console.log(html.substring(startIdx - 100, startIdx + 500));
}
