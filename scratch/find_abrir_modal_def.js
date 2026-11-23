const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
let pos = 0;
while ((pos = html.indexOf('function abrirModalNuevoMovimiento()', pos)) !== -1) {
    console.log('pos:', pos, html.slice(pos, pos + 800));
    pos += 1;
}
