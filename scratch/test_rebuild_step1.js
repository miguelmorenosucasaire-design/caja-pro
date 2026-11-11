const fs = require('fs');

console.log('Testing rebuild from scratch scripts...');
fs.copyFileSync('templates/index.html.bak', 'templates/index_test.html');
console.log('Copied bak to index_test.html');
