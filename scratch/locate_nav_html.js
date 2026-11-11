const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('top-nav-')) {
        console.log(`Top nav buttons starting around line ${i + 1}:`);
        for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 50); j++) {
            console.log(`${j + 1}: ${lines[j]}`);
        }
        break;
    }
}

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('sheet-tab-')) {
        console.log(`Sheet tabs starting around line ${i + 1}:`);
        for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 50); j++) {
            console.log(`${j + 1}: ${lines[j]}`);
        }
        break;
    }
}
