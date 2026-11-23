const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = 727320;
console.log(html.substring(idx, idx + 4000));
