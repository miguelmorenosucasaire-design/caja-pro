const fs = require('fs');
const content = fs.readFileSync('templates/index.html.bak_recibo', 'utf8');

const lines = content.split('\n');
console.log(lines.slice(670, 715).join('\n'));
