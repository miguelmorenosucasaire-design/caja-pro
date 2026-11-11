const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function cargarDocentes');
console.log(html.substring(idx + 2900, idx + 4000));
