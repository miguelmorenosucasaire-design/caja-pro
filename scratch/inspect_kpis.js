const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx = s.indexOf('id="section-dashboard"');
const slice = s.slice(idx + 2500, idx + 5000);
console.log(slice);
