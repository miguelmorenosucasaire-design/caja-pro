const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const modalStart = html.indexOf('id="modal-asignar-carrera-estudiante"');
console.log('Modal Assign HTML snippet:');
console.log(html.substring(modalStart - 100, modalStart + 2500));
