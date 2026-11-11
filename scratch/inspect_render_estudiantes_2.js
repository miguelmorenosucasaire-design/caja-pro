const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderEstudiantes');
console.log(html.substring(idx + 1800, idx + 4500));
