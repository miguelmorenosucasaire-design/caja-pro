const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8').split('\n');
s.forEach((l, i) => {
    if (l.includes("'/api/backups'") || l.includes("'/api/respaldos'")) {
        console.log('Line for backups:', i + 1, l);
    }
});
