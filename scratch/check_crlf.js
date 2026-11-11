const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const target1 = '</form>\r\n        </div>\r\n    </div>\r\n\r\n    <div id="modal-nuevo-grupo"';
const target2 = '</form>\n        </div>\n    </div>\n\n    <div id="modal-nuevo-grupo"';

console.log('CRLF match:', content.includes(target1));
console.log('LF match:', content.includes(target2));
