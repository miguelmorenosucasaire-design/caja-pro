const fs = require('fs');

console.log('Reading templates/index.html...');
let html = fs.readFileSync('templates/index.html', 'utf8');

// Backup original before modifications
fs.writeFileSync('templates/index.html.bak', html, 'utf8');
console.log('Backup created at templates/index.html.bak');
