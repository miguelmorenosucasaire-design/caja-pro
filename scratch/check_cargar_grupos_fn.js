const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

lines.forEach((l, i) => {
    if (l.includes('async function cargarGrupos') || l.includes('function cargarGrupos')) {
        console.log(`Line ${i + 1}: ${l}`);
        console.log(lines.slice(i, i + 25).join('\n'));
    }
});
