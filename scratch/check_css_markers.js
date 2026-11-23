const fs = require('fs');
const content = fs.readFileSync('templates/index.html.bak_recibo', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes('RECIBO INGRESO (MEDIA CARTA') || l.includes('ADAPTACIONES GENERALES DE TEMA OSCURO')) {
        console.log(`Line ${i+1}: ${JSON.stringify(l)}`);
    }
});
