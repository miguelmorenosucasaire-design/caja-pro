const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8').split('\n');
s.forEach((l, i) => {
    if (l.includes("'/api/estudiantes/nuevo-con-recibo'")) {
        console.log('Line for nuevo-con-recibo:', i + 1);
        console.log(s.slice(i, i + 35).join('\n'));
    }
    if (l.includes("'/api/backups'") && l.includes("method === 'POST'")) {
        console.log('Line for backup POST:', i + 1);
        console.log(s.slice(i, i + 35).join('\n'));
    }
});
