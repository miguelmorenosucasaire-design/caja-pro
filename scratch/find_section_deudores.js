const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('id="section-deudores"');
console.log('Index:', idx);
console.log(html.slice(idx, idx + 2500));
