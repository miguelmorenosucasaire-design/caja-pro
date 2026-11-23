const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
    if (l.includes("pathname === '/api/estudiantes'") || l.includes("nuevo-con-recibo")) {
        console.log(`Line ${i+1}: ${l}`);
    }
});
