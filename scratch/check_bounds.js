const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="contenedor-comprobante-oficial"')) {
        startLine = i;
    }
    if (startLine !== -1 && lines[i].includes('factura-inst-pie')) {
        endLine = i + 2; // close tag
        break;
    }
}

console.log(`contenedor-comprobante-oficial is from line ${startLine + 1} to ${endLine + 1}`);
console.log(lines.slice(startLine - 2, endLine + 3).join('\n'));
