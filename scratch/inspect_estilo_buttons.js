const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('id="btn-estilo-color"');
console.log(html.substring(idx - 200, idx + 600));
