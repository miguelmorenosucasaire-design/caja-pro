const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');

const lines = server.split('\n');
console.log('Searching for grupos in server.js:');
lines.forEach((l, i) => {
    if (l.includes('grupos') || l.includes('grupo')) {
        if (l.includes('SELECT') || l.includes('INSERT') || l.includes('UPDATE') || l.includes('pathname')) {
            console.log(`Line ${i + 1}: ${l.trim().substring(0, 100)}`);
        }
    }
});
