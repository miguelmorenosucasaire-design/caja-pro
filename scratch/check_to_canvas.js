const fs = require('fs');
const js = fs.readFileSync('public/html2pdf.bundle.min.js', 'utf8');

const idx = js.indexOf('toCanvas');
console.log('toCanvas at:', idx);
console.log(js.substring(idx - 100, idx + 1000));
