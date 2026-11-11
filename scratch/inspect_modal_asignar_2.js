const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('id="modal-asignar-carrera-estudiante"');
console.log(html.substring(idx + 1500, idx + 3500));
