const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const fnIdx = html.indexOf('function cambiarSeccion');
console.log('cambiarSeccion at:', fnIdx);
console.log(html.substring(fnIdx, fnIdx + 1200));
