const fs = require('fs');
const serverCode = fs.readFileSync('server.js', 'utf8');

const idx = serverCode.indexOf("if (pathname === '/api/grupos' && method === 'GET')");
console.log(serverCode.substring(idx, idx + 1200));
