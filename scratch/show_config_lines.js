const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const lines = html.substring(sPos).split('\n');

for (let i = 320; i <= 345; i++) {
    console.log(`${i}: ${lines[i]}`);
}
