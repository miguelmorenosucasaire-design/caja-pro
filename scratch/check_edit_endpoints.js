const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

console.log('Includes /api/grupos/:id/editar:', code.includes('/api/grupos') && code.includes('editar'));
console.log('Includes /api/docentes/:id/editar:', code.includes('/api/docentes') && code.includes('editar'));
