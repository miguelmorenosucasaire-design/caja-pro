const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
lines.forEach((l, idx) => {
    if (l.includes('id="section-resultados"')) console.log('section-resultados:', idx + 1);
    if (l.includes('<header')) console.log('header:', idx + 1);
});
