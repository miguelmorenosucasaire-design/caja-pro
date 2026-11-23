const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const ePos = html.indexOf('</main>');

const lines = html.substring(sPos, ePos).split('\n');

for (let i = 280; i < lines.length; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
