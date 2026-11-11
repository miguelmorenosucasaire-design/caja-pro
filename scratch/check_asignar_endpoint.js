const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');

const idx = server.indexOf('/api/estudiantes/') ;
const match = server.substring(idx - 100, idx + 2500);
console.log(match);
