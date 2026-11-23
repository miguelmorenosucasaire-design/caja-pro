const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
console.log(JSON.stringify(html.slice(721600, 722000)));
