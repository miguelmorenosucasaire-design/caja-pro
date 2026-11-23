const fs = require('fs');
const content = fs.readFileSync('public/img/minedu_azul.svg', 'utf8');
console.log('minedu_azul.svg length:', content.length);
console.log(content.substring(0, 300));
