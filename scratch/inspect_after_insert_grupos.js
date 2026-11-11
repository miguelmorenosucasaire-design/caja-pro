const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

const idx = code.indexOf('Grupo y encargado registrados exitosamente');
console.log(code.substring(idx, idx + 400));
