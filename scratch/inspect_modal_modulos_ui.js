const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('1.- Aporte por Mantenimiento (Módulos):');
console.log(html.substring(idx - 100, idx + 1200));
