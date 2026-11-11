const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function filtrarFacturaPillSeccion');
console.log(html.substring(idx + 1200, idx + 2600));
