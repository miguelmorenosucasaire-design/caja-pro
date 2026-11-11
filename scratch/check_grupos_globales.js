const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

lines.forEach((l, i) => {
    if (l.includes('gruposGlobales')) {
        console.log(`Line ${i + 1}: ${l}`);
    }
});
