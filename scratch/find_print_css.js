const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('@media print');
console.log('print at', idx);
console.log(html.slice(idx, idx + 3000));
