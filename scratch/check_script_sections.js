const fs = require('fs');
const s = fs.readFileSync('scratch/apply_new_sections.js', 'utf8');
console.log('apply_new_sections length:', s.length);
console.log(s.substring(0, 300));
