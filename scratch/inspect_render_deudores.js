const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderDeudores(');
console.log(html.substring(idx, idx + 2500));
