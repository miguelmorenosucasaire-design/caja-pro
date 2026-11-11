const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

console.log('Includes PUT:', code.includes("=== 'PUT'"));
console.log('Methods in server.js:');
const matches = code.match(/method === '[A-Z]+'/g) || [];
console.log([...new Set(matches)]);
