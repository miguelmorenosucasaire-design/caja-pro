const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

// Check pill buttons in SECCIONES / GRUPOS and FACTURA
const lines = s.split('\n');
console.log('--- Search for tab-fac-pill-btn or tab-grupo-btn ---');
lines.forEach((l, idx) => {
    if (l.includes('tab-fac-pill-btn') || l.includes('tab-grupo-btn')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});
