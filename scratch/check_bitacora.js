const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('Bitácora Oficial de Notas y Actividades');
console.log('Bitacora at', idx);
console.log(html.slice(idx, idx + 2000));
