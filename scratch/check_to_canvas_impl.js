const fs = require('fs');
const js = fs.readFileSync('public/html2pdf.bundle.min.js', 'utf8');

const idx = js.indexOf('A.prototype.toCanvas=function()');
console.log(js.substring(idx, idx + 1000));
