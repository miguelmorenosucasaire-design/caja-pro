const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const mIdx = content.indexOf('id="modal-editar-grupo"');
console.log('modal-editar-grupo at:', mIdx);
const endIdx = content.indexOf('</div>\n    </div>', mIdx);
console.log('End of modal-editar-grupo:', endIdx);
console.log(content.slice(endIdx, endIdx + 200));
