const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');
lines.forEach((l, idx) => {
    if (l.includes('diario') || l.includes('notas') || l.includes('nota')) {
        console.log(`Line ${idx + 1}: ${l.trim().substring(0, 100)}`);
    }
});
