const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const targets = ['imprimirFactura', 'RECIBO DE INGRESO', 'comprobante', 'voucher', 'factura'];
targets.forEach(t => {
    let idx = html.indexOf(t);
    console.log(t, 'found at', idx);
});
