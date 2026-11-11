const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function poblarSelectsCarreras');
console.log(html.substring(idx, idx + 1500));
