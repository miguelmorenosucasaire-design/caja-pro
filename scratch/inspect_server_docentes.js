const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

console.log('--- GET /api/docentes ---');
console.log(s.slice(78300, 80500));

console.log('--- POST /api/docentes & related ---');
console.log(s.slice(81700, 84000));
