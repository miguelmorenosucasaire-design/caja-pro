const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="section-factura"')) {
        console.log(lines.slice(i, i + 50).join('\n'));
        break;
    }
}
