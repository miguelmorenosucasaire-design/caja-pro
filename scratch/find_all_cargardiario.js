const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
let pos = 0;
while ((pos = html.indexOf('cargarDiario', pos)) !== -1) {
    console.log('pos:', pos, html.slice(pos - 40, pos + 80));
    pos += 1;
}
