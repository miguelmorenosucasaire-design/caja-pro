const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderEstudiantes');
console.log('renderEstudiantes snippet (2500 chars):');
console.log(html.substring(idx, idx + 2500));
