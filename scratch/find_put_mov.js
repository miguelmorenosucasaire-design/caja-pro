const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8').split('\n');
s.forEach((l, i) => {
    if (l.includes("'/api/movimientos/") && (l.includes("PUT") || l.includes("editar"))) {
        console.log('Line for edit mov:', i + 1, l);
    }
});
