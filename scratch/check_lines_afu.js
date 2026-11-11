const fs = require('fs');
const s = fs.readFileSync('scratch/apply_frontend_updates.js', 'utf8');
const lines = s.split('\n');
console.log(lines.slice(25, 60).join('\n'));
