const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="modal-nuevo-movimiento"');
const formEnd = html.indexOf('</form>', start);
console.log('formEnd:', formEnd);
console.log(html.slice(formEnd - 100, formEnd + 200));
