const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderEstudiantes');
console.log('renderEstudiantes snippet part 2:');
console.log(html.substring(idx + 2400, idx + 5000));
