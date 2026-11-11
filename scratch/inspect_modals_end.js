const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
console.log(html.substring(284600, 287000));
