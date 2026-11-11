const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx = s.indexOf('Sin Movimiento');
console.log(JSON.stringify(s.slice(idx - 60, idx + 400)));
