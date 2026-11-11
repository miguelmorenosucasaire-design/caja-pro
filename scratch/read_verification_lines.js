const fs = require('fs');
const lines = fs.readFileSync('scratch/run_full_system_verification.js', 'utf8').split('\n');

console.log(lines.slice(75, 140).join('\n'));
