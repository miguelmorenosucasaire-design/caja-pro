const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderGrupos');
const nextFn = html.indexOf('function ', idx + 25);
console.log(html.substring(idx, nextFn > 0 ? nextFn : idx + 3000));
