const fs = require('fs');
const serverCode = fs.readFileSync('server.js', 'utf8');

const matches = [...serverCode.matchAll(/pathname[^\n]*\/api\/grupos[^\n]*/g)];
console.log('Grupos routes in server.js:');
matches.forEach(m => console.log(m[0]));
