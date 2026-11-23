const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="modal-box-mod-1"');
console.log('modal-box-mod-1 at:', idx);
if (idx !== -1) {
  console.log(html.substring(idx - 500, idx + 800));
}
