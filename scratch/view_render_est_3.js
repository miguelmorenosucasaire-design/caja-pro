const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderEstudiantes');
console.log('renderEstudiantes snippet part 3:');
console.log(html.substring(idx + 4800, idx + 7500));
