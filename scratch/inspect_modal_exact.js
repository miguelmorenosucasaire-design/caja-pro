const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="modal-asignar-carrera-estudiante"');
const end = html.indexOf('</form>', start) + 15;
console.log(html.substring(start - 50, end + 100));
