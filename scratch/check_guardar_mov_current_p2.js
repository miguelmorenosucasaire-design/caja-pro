const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('async function guardarMovimiento(e)');
console.log(html.slice(idx + 1200, idx + 2600));
