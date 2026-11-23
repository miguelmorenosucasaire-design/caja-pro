const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const ePos = html.indexOf('</main>');

const sHtml = html.substring(sPos, ePos);
console.log('section-configuracion analysis:');

let lines = sHtml.split('\n');
let depth = 0;
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
            depth--;
            if (depth < 0) {
                console.log(`EXTRA CLOSE TAG: ${fullTag} at line ${lineNum + 1}: ${line.trim()}`);
            }
        } else {
            depth++;
        }
    }
}
console.log('Final depth of section-configuracion:', depth);
