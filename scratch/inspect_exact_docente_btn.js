const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('Guardar Cambios del Docente');
console.log(content.slice(idx - 250, idx + 100));
