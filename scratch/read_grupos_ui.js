const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
console.log('--- section-grupos (820-860) ---');
console.log(lines.slice(819, 860).join('\n'));
console.log('--- renderGrupos (6715-6770) ---');
console.log(lines.slice(6714, 6770).join('\n'));
