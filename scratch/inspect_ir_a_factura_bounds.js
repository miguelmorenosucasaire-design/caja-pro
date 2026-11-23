const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx1 = html.indexOf('function irAFacturaDesdeFichaEstudiante');
const nextFn = html.indexOf('function cambiarVistaComprobante', idx1);
console.log('irAFactura from', idx1, 'to', nextFn);
console.log(html.substring(idx1, nextFn));
