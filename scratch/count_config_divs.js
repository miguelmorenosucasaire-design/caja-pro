const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const ePos = html.indexOf('</main>');

const sHtml = html.substring(sPos, ePos);
const lines = sHtml.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let re = /<\/?div\b[^>]*>/g;
    let m;
    while ((m = re.exec(line)) !== null) {
        if (m[0].startsWith('</')) {
            if (stack.length === 0) {
                console.log(`EXTRA </div> at line ${i+1}: ${line.trim()}`);
            } else {
                stack.pop();
            }
        } else {
            stack.push({ line: i+1, text: m[0] });
        }
    }
}

console.log('Finished. Stack length:', stack.length);
