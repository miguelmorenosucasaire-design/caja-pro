const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
const idx = lines.findIndex(l => l.includes('function poblarSelectorEstudiantesPorCarrera'));
console.log('Index:', idx);
console.log(lines.slice(idx, idx + 45).join('\n'));
