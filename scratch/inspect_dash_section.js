const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const dashStart = html.indexOf('id="section-dashboard"');
const nextSec = html.indexOf('id="section-resultados"');
console.log('Dashboard section content length:', nextSec - dashStart);
console.log(html.substring(dashStart, dashStart + 3000));
