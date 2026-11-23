const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const idx = code.indexOf("pathname === '/api/movimientos' && method === 'POST'");
console.log(code.slice(idx + 3500, idx + 5000));
