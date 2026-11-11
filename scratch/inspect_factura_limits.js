const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('<div id="section-factura"');
console.log('start of section-factura:', start);

const end = html.indexOf('<div id="section-', start + 50);
console.log('end of section-factura (next section):', end);

console.log('Length of section-factura:', end - start);
