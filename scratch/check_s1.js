const fs = require('fs');

console.log('Reading apply_frontend_updates.js start...');
const s1 = fs.readFileSync('scratch/apply_frontend_updates.js', 'utf8');
console.log('s1 length:', s1.length, s1.substring(0, 300));
