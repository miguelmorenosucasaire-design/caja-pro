const fs = require('fs');
const bak = fs.readFileSync('templates/index.html.bak', 'utf8');

console.log('bak length:', bak.length);
const sections = [...bak.matchAll(/id="section-([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
console.log('Sections in index.html.bak:', sections);
