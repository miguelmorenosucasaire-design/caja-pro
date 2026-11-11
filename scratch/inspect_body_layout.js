const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const bodyMatch = html.match(/<body[\s\S]*?<main[\s\S]*?>/);
console.log('Body and main container:');
console.log(bodyMatch ? bodyMatch[0] : 'not found');
