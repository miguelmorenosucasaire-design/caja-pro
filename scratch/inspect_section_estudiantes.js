const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('id="section-estudiantes"');
console.log(html.substring(idx, idx + 4000));
