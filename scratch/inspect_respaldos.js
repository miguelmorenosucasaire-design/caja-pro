const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx = s.indexOf('id="section-respaldos"');
console.log(s.slice(idx + 2500, idx + 6000));
