const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('function poblarSelectorFactura');
console.log('poblarSelectorFactura:');
console.log(content.slice(idx, idx + 1000));
