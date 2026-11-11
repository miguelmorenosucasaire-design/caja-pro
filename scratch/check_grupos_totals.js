const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const lines = s.split('\n');
console.log('--- Search for grupos-total-count ---');
lines.forEach((l, idx) => {
    if (l.includes('grupos-total-count') || l.includes('grupos-total-ingresos') || l.includes('grupos-total-egresos')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});
