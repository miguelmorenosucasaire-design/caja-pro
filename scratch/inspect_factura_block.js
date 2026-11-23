const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes('id="contenedor-impresion-factura"'));
let end = start;
for (let i = start; i < lines.length; i++) {
    if (lines[i].includes('<!-- FIN COMPROBANTE') || lines[i].includes('<!-- PREVISUALIZADOR PDF OFICIAL') || lines[i].includes('id="factura-vista-pdf"')) {
        end = i;
        break;
    }
}
console.log(`Start: ${start + 1}, End: ${end + 1}`);
console.log(lines.slice(start, start + 30).join('\n'));
console.log('...');
console.log(lines.slice(end - 25, end + 5).join('\n'));
