const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const cssIdx = html.indexOf('.generando-pdf-oficial.recibo-hoja');
const nextCssIdx = html.indexOf('.custom-scrollbar', cssIdx);
console.log('CSS from', cssIdx, 'to', nextCssIdx);
console.log(html.substring(cssIdx, nextCssIdx));
