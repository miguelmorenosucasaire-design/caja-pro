const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes('id="contenedor-impresion-factura"'));
for (let i = start + 1; i < start + 250; i++) {
    if (lines[i].includes('<!-- PREVISUALIZADOR PDF OFICIAL') || lines[i].includes('id="factura-vista-pdf"') || lines[i].includes('EDITAR NOTAS DEL COMPROBANTE')) {
        console.log(`Marker found at line ${i+1}: ${lines[i]}`);
    }
}
