const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('generarLibroExcelActualizado')) {
        for (let j = i; j < i + 100; j++) {
            if (lines[j].includes('notas') || lines[j].includes('Observaciones')) {
                console.log(`Line ${j + 1}: ${lines[j].trim()}`);
            }
        }
        break;
    }
}
