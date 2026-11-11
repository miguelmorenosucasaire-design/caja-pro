const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = 143002;
// Let's find the nearest `function ` backwards
const lastFnIndex = html.lastIndexOf('function ', idx);
console.log('Last function definition before index:', lastFnIndex);
console.log(html.substring(lastFnIndex, lastFnIndex + 200));
