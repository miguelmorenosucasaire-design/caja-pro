const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const fnIdx = html.indexOf('function cambiarSeccion');
console.log(html.substring(fnIdx + 900, fnIdx + 2000));
