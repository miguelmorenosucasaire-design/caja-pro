const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const idx1 = s.indexOf('// 4. Hoja DOCENTES');
console.log('--- Hoja DOCENTES in server.js ---');
console.log(s.slice(idx1, idx1 + 750));

const idx2 = s.indexOf("pathname === '/api/docentes' && method === 'GET'");
console.log('--- GET /api/docentes in server.js ---');
console.log(s.slice(idx2, idx2 + 600));
