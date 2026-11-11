const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const cIdx = content.indexOf('id="section-carreras"');
console.log(content.slice(cIdx - 200, cIdx + 400));
