const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const ePos = html.indexOf('</main>');

const sHtml = html.substring(sPos, ePos);
let lines = sHtml.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let re = /<\/?div\b[^>]*>/g;
    let m;
    while ((m = re.exec(line)) !== null) {
        if (m[0].startsWith('</')) {
            const popped = stack.pop();
            // console.log(`line ${i+1}: closed div matching open at line ${popped ? popped.line : 'NONE'}`);
        } else {
            stack.push({ line: i+1, text: m[0] });
        }
    }
}
console.log('Unclosed divs inside section-configuracion:');
stack.forEach(s => console.log(`  Line ${s.line}: ${s.text}`));
