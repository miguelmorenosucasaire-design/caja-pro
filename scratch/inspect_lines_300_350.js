const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const lines = html.split('\n');
console.log(lines.slice(300, 350).join('\n'));
