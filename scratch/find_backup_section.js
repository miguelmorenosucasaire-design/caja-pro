const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
lines.forEach((l, idx) => {
    if (l.toLowerCase().includes('backup') && l.includes('id=')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});
