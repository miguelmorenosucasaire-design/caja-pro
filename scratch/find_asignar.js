const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');

const idx = server.indexOf('/asignar');
console.log(server.substring(idx - 100, idx + 1200));
