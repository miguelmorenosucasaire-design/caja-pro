const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx = s.indexOf('function restaurarRespaldo');
if (idx !== -1) {
    console.log(s.slice(idx, idx + 1000));
} else {
    console.log('function restaurarRespaldo not found, searching restaurar:');
    let i = 0;
    while((i = s.indexOf('restaurar', i)) !== -1) {
        console.log(s.slice(i - 20, i + 80).replace(/\s+/g, ' '));
        i += 9;
    }
}
