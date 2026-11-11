const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="section-grupos"')) {
        console.log(`section-grupos starts at line ${i + 1}:`);
        for (let j = i; j < i + 65; j++) {
            console.log(`${j + 1}: ${lines[j]}`);
        }
        break;
    }
}
