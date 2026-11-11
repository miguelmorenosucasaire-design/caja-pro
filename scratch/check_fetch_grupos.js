const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

lines.forEach((l, i) => {
    if (l.includes("'/api/grupos'") || l.includes('"/api/grupos"') || l.includes('`/api/grupos')) {
        console.log(`Line ${i + 1}: ${l}`);
    }
});
