const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
console.log(html.slice(698430, 700000));
