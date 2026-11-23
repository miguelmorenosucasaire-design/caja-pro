const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('/api/estudiantes/nuevo-con-recibo'));
console.log('Route line:', idx + 1);
if (idx !== -1) {
    console.log(lines.slice(idx, idx + 60).join('\n'));
}
