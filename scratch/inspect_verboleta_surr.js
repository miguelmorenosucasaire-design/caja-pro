const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('verBoletaDocente');
console.log(html.substring(idx - 50, idx + 350));
