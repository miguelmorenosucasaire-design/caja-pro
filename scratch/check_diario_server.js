const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const idx = code.indexOf("/api/diario' && method === 'GET'");
console.log(code.slice(idx, idx + 1000));
