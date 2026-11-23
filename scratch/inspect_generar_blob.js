const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = html.indexOf('function generarBlobPDF');
console.log(html.substring(startIdx, startIdx + 3500));
