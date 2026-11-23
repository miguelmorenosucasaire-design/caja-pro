const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(5450, 5490).join('\n'));
