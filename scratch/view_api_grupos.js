const fs = require('fs');
const serverCode = fs.readFileSync('server.js', 'utf8');

const idx = serverCode.indexOf("pathname === '/api/grupos' && method === 'GET'");
console.log(serverCode.substring(idx - 100, idx + 1500));
