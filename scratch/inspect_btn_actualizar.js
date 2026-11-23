const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const idx = lines.findIndex(l => l.includes('btn-actualizar-sistema'));
console.log('Line:', idx + 1);
console.log(lines.slice(idx - 10, idx + 25).join('\n'));
