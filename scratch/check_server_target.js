const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');

const targetStr = "pathname.endsWith('/asignar')";
const idx = server.indexOf(targetStr);
console.log(server.substring(idx - 100, idx + 1200));
