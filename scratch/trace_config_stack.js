const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const ePos = html.indexOf('</main>');

const sHtml = html.substring(sPos, ePos);

let lines = sHtml.split('\n');
let stack = [];
for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let m;
    const lineTagRegex = /<\/?([a-zA-Z0-9]+)(\s+[^>]*)?>/g;
    while ((m = lineTagRegex.exec(line)) !== null) {
        const fullTag = m[0];
        const tagName = m[1].toLowerCase();
        if (['input', 'img', 'br', 'hr', 'meta', 'link'].includes(tagName)) continue;
        if (fullTag.endsWith('/>')) continue;
        
        if (fullTag.startsWith('</')) {
            const popped = stack.pop();
            // console.log(`line ${lineNum}: popped </${tagName}> matching <${popped ? popped.tagName : 'NONE'}> at line ${popped ? popped.line : 'NONE'}`);
        } else {
            stack.push({ tagName, line: lineNum, text: fullTag });
        }
    }
}
console.log('Remaining in config stack:', stack);
