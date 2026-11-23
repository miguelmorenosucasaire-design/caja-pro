const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('function filtrarDeudoresEnTabla');
console.log(html.substring(idx, idx + 4000));
