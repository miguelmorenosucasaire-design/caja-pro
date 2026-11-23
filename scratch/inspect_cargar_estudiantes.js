const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('async function cargarEstudiantes');
console.log(html.substring(idx + 1000, idx + 4000));
