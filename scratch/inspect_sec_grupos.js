const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx = s.indexOf('id="section-grupos"');
console.log(s.slice(idx, idx + 1500));
