const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const p2 = html.indexOf('<!DOCTYPE html>', 100);
console.log('p2:', p2);
const secondCopy = html.substring(p2);
console.log('Second copy length:', secondCopy.length);
console.log('Ends with </html>?', secondCopy.trim().endsWith('</html>'));
