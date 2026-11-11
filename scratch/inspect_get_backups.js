const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const idx = s.indexOf("pathname === '/api/backups' && method === 'GET'");
console.log(s.slice(idx, idx + 1800));
