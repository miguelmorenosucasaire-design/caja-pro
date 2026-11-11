const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const sFactura = html.indexOf('id="section-factura"');
const sConf = html.indexOf('id="section-configuracion"');
const facturaHtml = html.substring(sFactura, sConf);
const lines = facturaHtml.split('\n');

let balance = 0;
const stack = [];

lines.forEach((line, idx) => {
    const tokens = line.match(/<\/?div(?:\s[^>]*)?>/gi) || [];
    tokens.forEach(tok => {
        if (tok.startsWith('</')) {
            balance--;
            const popped = stack.pop();
        } else {
            balance++;
            stack.push({ line: idx + 1, tag: tok });
        }
    });
});

console.log('Balance final en section-factura:', balance);
console.log('Divs abiertos sin cerrar:', stack);
