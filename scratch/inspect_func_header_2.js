const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = 655075;
console.log(html.substring(idx - 2500, idx - 1000));
