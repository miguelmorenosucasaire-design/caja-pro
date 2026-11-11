const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('modal-editar-grupo');
console.log('modal-editar-grupo exists:', idx !== -1);
if (idx !== -1) {
    console.log(content.slice(idx - 100, idx + 1000));
}
