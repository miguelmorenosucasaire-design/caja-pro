const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="section-grupos"');
const end = html.indexOf('id="section-estudiantes"');
console.log('Section grupos HTML:');
console.log(html.substring(start, start + 3500));
