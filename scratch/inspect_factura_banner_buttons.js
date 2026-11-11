const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
console.log(html.substring(149500, 151500));
