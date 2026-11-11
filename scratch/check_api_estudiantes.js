const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');
lines.forEach((l, idx) => {
    if (l.includes("pathname === '/api/estudiantes'")) {
        console.log(`Line ${idx + 1}: ${l}`);
        console.log(lines.slice(idx, idx + 40).join('\n'));
    }
});
