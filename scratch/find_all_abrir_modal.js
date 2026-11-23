const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
let pos = 0;
while ((pos = html.indexOf('abrirModalNuevoMovimiento', pos)) !== -1) {
    console.log('pos:', pos, html.slice(pos - 30, pos + 70));
    pos += 1;
}
