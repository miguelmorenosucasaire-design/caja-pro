const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const ePos = html.indexOf('</main>');

const lines = html.substring(sPos, ePos).split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    const re = /<\/?div\b[^>]*>/g;
    while ((m = re.exec(line)) !== null) {
        if (m[0].startsWith('</')) {
            if (stack.length === 0) {
                console.log(`EXTRA </div> at relative line ${i+1}: ${line.trim()}`);
            } else {
                stack.pop();
            }
        } else {
            stack.push({ line: i+1, text: m[0] });
        }
    }
}
console.log('Final unclosed divs in section-configuracion:');
stack.forEach(s => console.log(`  Line ${s.line}: ${s.text}`));
