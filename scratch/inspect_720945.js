const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
console.log(html.slice(720900, 722000));
