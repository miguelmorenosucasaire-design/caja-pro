const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function seleccionarFacturaRecibo(')) {
        console.log('seleccionarFacturaRecibo start:', i + 1);
        for (let j = i; j < i + 40; j++) {
            console.log(lines[j]);
            if (lines[j].trim() === '}') {
                console.log('seleccionarFacturaRecibo end:', j + 1);
                break;
            }
        }
        break;
    }
}
