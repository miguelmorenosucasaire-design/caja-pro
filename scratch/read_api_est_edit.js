const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('/api/estudiantes/') && (lines[i].includes('PUT') || lines[i].includes('POST') || lines[i].includes('asignar'))) {
        console.log(`Line ${i + 1}: ${lines[i]}`);
        console.log(lines.slice(i, i + 35).join('\n'));
        break;
    }
}
