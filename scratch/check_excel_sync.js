const fs = require('fs');
const server = fs.readFileSync('server.js', 'utf8');
const lines = server.split('\n');

let start = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function guardarLibroExcelEnDisco')) {
        start = i;
        break;
    }
}

if (start !== -1) {
    console.log(lines.slice(start, start + 60).join('\n'));
} else {
    console.log('guardarLibroExcelEnDisco not found');
}
