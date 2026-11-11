const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('function cambiarSeccion(');
const end = html.indexOf('function poblarSelectsGrupos');
console.log(html.substring(start, end));
