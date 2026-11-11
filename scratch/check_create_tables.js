const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const lines = s.split('\n');
console.log('--- Search CREATE TABLE ---');
lines.forEach((l, idx) => {
    if (l.includes('CREATE TABLE')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});
