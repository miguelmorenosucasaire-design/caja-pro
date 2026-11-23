const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');

const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('MIME') || l.includes('contentType') || l.includes('mime'));
console.log('MIME section around line', idx + 1);
console.log(lines.slice(idx - 5, idx + 35).join('\n'));
