const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

let idx = 0;
while((idx = s.indexOf('/api/backup', idx)) !== -1) {
    console.log(s.slice(idx - 20, idx + 100).replace(/\s+/g, ' '));
    idx += 12;
}
