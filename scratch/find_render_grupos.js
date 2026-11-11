const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
console.log('--- Search for renderGrupos ---');
lines.forEach((l, idx) => {
    if (l.includes('function renderGrupos') || l.includes('renderGrupos(')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});
