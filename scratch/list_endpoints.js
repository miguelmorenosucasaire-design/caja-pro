const fs = require('fs');
const serverCode = fs.readFileSync('server.js', 'utf8');

const endpoints = [];
const lines = serverCode.split('\n');
lines.forEach((l, idx) => {
    if (l.includes("pathname === '") || l.includes('pathname.match(') || l.includes('pathname.startsWith(')) {
        endpoints.push(`Line ${idx + 1}: ${l.trim()}`);
    }
});
console.log('Endpoints in server.js:\n' + endpoints.join('\n'));
