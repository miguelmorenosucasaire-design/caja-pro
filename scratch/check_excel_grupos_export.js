const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("sheet === 'grupos'") || lines[i].includes("Hoja GRUPOS") || lines[i].includes("SECCIONES Y GRUPOS")) {
        console.log(`Line ${i + 1}: ${lines[i]}`);
        console.log(lines.slice(i, i + 35).join('\n'));
        break;
    }
}
