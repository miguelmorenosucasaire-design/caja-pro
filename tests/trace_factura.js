const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const sFactura = html.indexOf('id="section-factura"');
const sConf = html.indexOf('id="section-configuracion"');
const facturaHtml = html.substring(sFactura, sConf);
const lines = facturaHtml.split('\n');
let balance = 0;
lines.forEach((line, idx) => {
    const opens = (line.match(/<div(?:\s[^>]*)?>/gi) || []).length;
    const closes = (line.match(/<\/div>/gi) || []).length;
    balance += opens - closes;
    if (idx > lines.length - 15) {
        console.log(`Line ${idx}: balance=${balance} | ${line.trim()}`);
    }
});
console.log('Final balance in section-factura:', balance);
