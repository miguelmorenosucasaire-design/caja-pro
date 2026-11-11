const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="section-grupos"');
const end = html.indexOf('id="section-estudiantes"');
const chunk = html.substring(start, end);

console.log('Length of section-grupos:', chunk.length);
console.log('Contains grid-grupos:', chunk.includes('grid-grupos'));
console.log('First 500 chars:');
console.log(chunk.substring(0, 500));
console.log('\nLast 500 chars:');
console.log(chunk.substring(chunk.length - 500));
