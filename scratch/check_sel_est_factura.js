const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('function seleccionarEstudianteFactura');
console.log('seleccionarEstudianteFactura at', idx);
console.log(html.slice(idx, idx + 2000));
