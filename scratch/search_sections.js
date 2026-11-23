const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const search = [
    'Vista Comprobante',
    'Previsualizador PDF Oficial',
    'FORMATO:',
    'DESCARGAR PDF:',
    'contenedor-impresion-factura',
    'EDITAR NOTAS DEL COMPROBANTE',
    'btn-actualizar'
];

search.forEach(s => {
    const idx = lines.findIndex(l => l.includes(s));
    console.log(`Found "${s}" at line ${idx + 1}`);
});
