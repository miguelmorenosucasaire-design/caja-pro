const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function cambiarSeccion(')) {
        console.log(`cambiarSeccion at line ${i + 1}:`);
        for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 45); j++) {
            console.log(`${j + 1}: ${lines[j]}`);
        }
        break;
    }
}
