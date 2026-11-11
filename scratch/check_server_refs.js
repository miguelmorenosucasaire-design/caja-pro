const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const lines = s.split('\n');
lines.forEach((l, idx) => {
    if (l.includes('.xlsx') || l.includes('.xlsm') || l.includes('.db') || l.includes('.bat') || l.includes('.ico') || l.includes('templates') || l.includes('public')) {
        console.log(`${idx + 1}: ${l.trim()}`);
    }
});
