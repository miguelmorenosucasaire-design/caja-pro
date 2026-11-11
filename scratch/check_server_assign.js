const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');

const idx = server.indexOf('/api/estudiantes/') ;
const block = server.substring(idx - 50, idx + 2000);
console.log(block);
