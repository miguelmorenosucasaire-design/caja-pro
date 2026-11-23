const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('grid.innerHTML');
console.log(html.substring(idx - 100, idx + 2500));
