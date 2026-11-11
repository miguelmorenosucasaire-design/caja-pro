const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx1 = s.indexOf('👥 Matriculados:');
if (idx1 !== -1) console.log('Match 1:\n', s.slice(idx1 - 80, idx1 + 250));

const idx2 = s.indexOf('👥');
if (idx2 !== -1) {
    const idx3 = s.indexOf('👥', idx2 + 1);
    if (idx3 !== -1) console.log('Match 2:\n', s.slice(idx3 - 80, idx3 + 250));
}
