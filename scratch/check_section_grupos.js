const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const lines = html.split('\n');
console.log('Searching for section-grupos...');
lines.forEach((l, i) => {
    if (l.includes('id="section-grupos"') || l.includes('function renderGrupos') || l.includes('function cargarGrupos')) {
        console.log(`Line ${i + 1}: ${l.trim().substring(0, 100)}`);
    }
});
