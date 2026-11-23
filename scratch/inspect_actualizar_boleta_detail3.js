const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function actualizarBoletaModalEnVivo');
console.log(html.substring(idx + 4000, idx + 6000));
