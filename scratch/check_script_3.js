const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const scriptMatch = html.match(/<script[\s\S]*?<\/script>/gi);
console.log('Script 3 total length:', scriptMatch[3].length);
console.log('Script 3 start snippet:');
console.log(scriptMatch[3].substring(0, 500));
