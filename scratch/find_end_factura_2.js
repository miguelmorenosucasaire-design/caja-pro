const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const start = lines.findIndex(l => l.includes('id="contenedor-impresion-factura"'));
for (let i = start + 1; i < start + 500; i++) {
    if (lines[i].includes('EDITAR NOTAS') || lines[i].includes('previsualizador') || lines[i].includes('pdf-iframe')) {
        console.log(`Marker found at line ${i+1}: ${lines[i]}`);
    }
}
