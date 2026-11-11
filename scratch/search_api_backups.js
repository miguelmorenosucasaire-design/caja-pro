const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

let idx = 0;
while((idx = s.indexOf('/api/backups', idx)) !== -1) {
    console.log(s.slice(idx - 40, idx + 80).replace(/\s+/g, ' '));
    idx += 12;
}
