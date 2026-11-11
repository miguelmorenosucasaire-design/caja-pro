const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');
const lines = s.split('\n');
lines.forEach((line, i) => {
    if (line.includes('API:') || line.includes('/api/')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
});
