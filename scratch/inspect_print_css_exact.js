const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('@media print');
console.log(html.substring(idx - 100, idx + 1400));
