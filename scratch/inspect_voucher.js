const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const target = 'id="contenedor-impresion-factura"';
const start = html.indexOf(target);
console.log('Index:', start);
if (start !== -1) {
    console.log(html.substring(start - 200, start + 3000));
}
