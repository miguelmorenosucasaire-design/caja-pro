const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const idx = s.indexOf('// 6.2 API: RECIBO OFICIAL EN EXCEL');
console.log('Index of 6.2:', idx);
if (idx !== -1) {
    console.log(s.substring(idx - 100, idx + 4000));
}
