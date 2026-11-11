const fs = require('fs');
const test = fs.readFileSync('scratch/run_full_system_verification.js', 'utf8');

const lines = test.split('\n');
lines.forEach((l, i) => {
    if (l.includes('grupos') || l.includes('grupo') || l.includes('Sección')) {
        console.log(`Line ${i + 1}: ${l.trim()}`);
    }
});
