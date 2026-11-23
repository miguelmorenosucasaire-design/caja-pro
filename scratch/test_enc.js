const fs = require('fs');
const content = fs.readFileSync('public/recibo_svg/02_encabezado_texto.svg', 'utf8');
console.log('02_encabezado_texto length:', content.length);
