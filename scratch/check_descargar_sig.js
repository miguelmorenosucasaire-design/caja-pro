const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function descargarBoletaModalDirecta');
console.log(html.substring(idx - 10, idx + 150));
