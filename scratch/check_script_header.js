const fs = require('fs');
const s = fs.readFileSync('scratch/apply_header_update.js', 'utf8');
console.log('apply_header_update length:', s.length);
console.log(s.substring(0, 300));
