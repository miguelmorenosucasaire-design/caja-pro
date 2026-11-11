const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id="section-factura"')) {
        start = i;
    }
    if (start !== -1 && lines[i].includes('id="section-configuracion"')) {
        end = i;
        break;
    }
}

console.log(`section-factura is from line ${start + 1} to ${end + 1}`);
console.log(lines.slice(start, start + 60).join('\n'));
