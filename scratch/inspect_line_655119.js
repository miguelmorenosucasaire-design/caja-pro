const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = 655119;
console.log(html.substring(idx - 200, idx + 1000));
