const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8').split('\n');
s.forEach((l, i) => {
    if (l.includes('/detalle')) {
        console.log('Line for detalle:', i + 1);
        console.log(s.slice(i, i + 45).join('\n'));
    }
});
