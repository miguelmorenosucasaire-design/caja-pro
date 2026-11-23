const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const cssMatches = [];
lines.forEach((l, i) => {
    if (l.includes('.recibo-hoja') || l.includes('.recibo {') || l.includes('--rc-azul')) {
        cssMatches.push({ line: i + 1, text: l });
    }
});
console.log(cssMatches);
