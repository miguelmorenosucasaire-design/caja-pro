const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('id="section-control-pagos"');
console.log('Control pagos at', idx);
console.log(html.slice(idx, idx + 2500));
