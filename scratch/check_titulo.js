const fs = require('fs');
const content = fs.readFileSync('public/recibo_svg/07_titulo_ingresos.svg', 'utf8');
console.log('07_titulo_ingresos.svg fill colors:', Array.from(new Set(content.match(/fill="[^"]*"/g))));
