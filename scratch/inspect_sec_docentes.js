const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');
const idx = s.indexOf('id="section-docentes"');
console.log(s.slice(idx, idx + 2000));
