const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');
lines.forEach((l, idx) => {
    if (l.includes('CREATE TABLE IF NOT EXISTS estudiantes')) {
        console.log(`Line ${idx + 1}: ${l}`);
    }
});
