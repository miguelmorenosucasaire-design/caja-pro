const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx = s.indexOf('id="section-dashboard"');
console.log('section-dashboard index:', idx);
const slice = s.slice(idx, idx + 2500);
console.log(slice);
