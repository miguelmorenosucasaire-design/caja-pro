const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const idx = s.indexOf("pathname === '/api/deudores' && method === 'GET'");
console.log(s.substring(idx, idx + 2500));
