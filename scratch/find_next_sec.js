const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = content.indexOf('id="section-grupos"');
const nextSecIdx = content.indexOf('id="section-estudiantes"');
console.log('section-grupos length until section-estudiantes:', nextSecIdx - startIdx);
