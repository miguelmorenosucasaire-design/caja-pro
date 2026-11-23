const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const pos = 817114 + 6000;
console.log(html.substring(pos, pos + 2500));
