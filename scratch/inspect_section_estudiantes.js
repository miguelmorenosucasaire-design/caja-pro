const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="section-estudiantes"');
const end = html.indexOf('id="section-docentes"');
console.log('Section estudiantes start:', start, 'end:', end, 'length:', end - start);
console.log(html.substring(start, start + 2500));
