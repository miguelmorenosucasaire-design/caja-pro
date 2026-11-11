const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('resultados.push({') && i > 1500 && i < 1650) {
        console.log(lines.slice(i, i + 35).join('\n'));
        break;
    }
}
