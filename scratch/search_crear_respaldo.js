const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

let idx = 0;
while((idx = s.indexOf('crearRespaldoManual', idx)) !== -1) {
    console.log(s.slice(idx - 30, idx + 100).replace(/\s+/g, ' '));
    idx += 19;
}
