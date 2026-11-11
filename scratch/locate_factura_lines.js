const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="section-factura"')) {
        console.log('section-factura starts at line ' + (i + 1));
        for (let j = i; j < i + 60; j++) {
            console.log((j + 1) + ': ' + lines[j]);
        }
        break;
    }
}
