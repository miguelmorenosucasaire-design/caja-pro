const fs = require('fs');
const content = fs.readFileSync('public/recibo_svg/04_escudo_cetpro.svg', 'utf8');
console.log('04_escudo_cetpro.svg paths count:', (content.match(/<path/g) || []).length);
console.log('Fill colors:', Array.from(new Set(content.match(/fill="[^"]*"/g))));
