const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
console.log('--- Search for renderEstudiantes ---');
lines.forEach((l, idx) => {
    if (l.includes('function renderEstudiantes') || l.includes('renderEstudiantes(')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});
