const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('function cambiarSeccion');
console.log(html.slice(idx + 1500, idx + 3000));
