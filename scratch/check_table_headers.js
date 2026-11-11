const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('id="tbody-estudiantes"');
console.log('Around tbody-estudiantes:');
console.log(html.substring(idx - 1200, idx + 200));
