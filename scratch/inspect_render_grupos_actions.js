const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderGrupos');
console.log(html.substring(idx + 3200, idx + 4500));
