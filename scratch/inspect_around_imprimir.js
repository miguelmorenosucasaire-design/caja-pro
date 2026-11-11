const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('imprimirFactura');
console.log(html.substring(idx - 500, idx + 2500));
