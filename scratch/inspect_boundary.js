const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const resStart = html.indexOf('id="section-resultados"');
console.log(html.substring(resStart - 500, resStart + 100));
