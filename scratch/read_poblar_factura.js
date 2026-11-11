const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('poblarSelectorFactura')) {
        console.log(`poblarSelectorFactura found at line ${i + 1}`);
        console.log(lines.slice(i, i + 80).join('\n'));
        break;
    }
}
