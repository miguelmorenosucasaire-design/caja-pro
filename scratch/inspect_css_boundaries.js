const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

console.log('Lines 70-85:');
console.log(lines.slice(70, 85).join('\n'));

console.log('\nLines 240-270:');
console.log(lines.slice(240, 270).join('\n'));
