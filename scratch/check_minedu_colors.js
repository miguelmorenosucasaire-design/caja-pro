const fs = require('fs');
const content = fs.readFileSync('public/recibo_svg/01_logo_ministerio.svg', 'utf8');
console.log('01_logo_ministerio.svg fill colors:', Array.from(new Set(content.match(/fill="[^"]*"/g))));
