const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('id="modal-editar-docente"');
const formEnd = content.indexOf('</form>', idx);
console.log(JSON.stringify(content.slice(formEnd, formEnd + 100)));
