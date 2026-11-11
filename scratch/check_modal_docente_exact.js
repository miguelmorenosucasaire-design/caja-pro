const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('id="modal-editar-docente"');
console.log('modal-editar-docente at:', idx);
const formEnd = content.indexOf('</form>', idx);
console.log(content.slice(formEnd - 100, formEnd + 100));
