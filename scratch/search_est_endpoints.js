const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');

lines.forEach((l, i) => {
    if (l.includes("pathname.startsWith('/api/estudiantes/") || l.includes("pathname === '/api/estudiantes/")) {
        console.log(`Line ${i + 1}: ${l}`);
    }
});
