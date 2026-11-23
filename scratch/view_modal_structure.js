const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = html.indexOf('id="modal-nuevo-movimiento"');
const formIdx = html.indexOf('<form id="form-nuevo-movimiento"', startIdx);
const endIdx = html.indexOf('</form>', formIdx);
const closeDivIdx = html.indexOf('</div>\n    </div>', endIdx);

console.log('startIdx:', startIdx);
console.log('formIdx:', formIdx);
console.log('endIdx:', endIdx);
console.log('closeDivIdx:', closeDivIdx);
console.log(html.slice(startIdx, startIdx + 800));
