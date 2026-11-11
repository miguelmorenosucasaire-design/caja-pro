const fs = require('fs');
const s = fs.readFileSync('scratch/apply_javascript_updates.js', 'utf8');
console.log('apply_javascript_updates length:', s.length);
console.log(s.substring(0, 300));
