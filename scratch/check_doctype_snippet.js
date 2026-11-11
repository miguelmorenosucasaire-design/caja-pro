const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('Snippet around 334524:');
console.log(html.substring(334400, 335000));
