const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const bodyStart = html.indexOf('<body');
const bodyEnd = html.indexOf('</body>');

const bodyHtml = html.substring(bodyStart, bodyEnd);

// Regex for html tags
const tagRegex = /<\/?([a-zA-Z0-9]+)(\s+[^>]*)?>/g;
let match;
let stack = [];
let errors = [];

const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

let lines = bodyHtml.split('\n');
let charOffset = 0;

for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let lineRegex = /<\/?([a-zA-Z0-9]+)(\s+[^>]*)?>/g;
    let m;
    while ((m = lineRegex.exec(line)) !== null) {
        const fullTag = m[0];
        const tagName = m[1].toLowerCase();
        
        if (voidTags.has(tagName) || fullTag.endsWith('/>')) {
            continue;
        }
        
        if (fullTag.startsWith('</')) {
            if (stack.length === 0) {
                console.log(`ERROR: Extra closing </${tagName}> at line ${lineIdx + 1} of body: ${line.trim()}`);
            } else {
                const top = stack.pop();
                if (top.tagName !== tagName) {
                    console.log(`MISMATCH: Expected </${top.tagName}> (opened line ${top.line}) but got </${tagName}> at line ${lineIdx + 1}: ${line.trim()}`);
                }
            }
        } else {
            // Opening tag
            // Check if it has an id
            const idMatch = fullTag.match(/id="([^"]+)"/);
            const id = idMatch ? idMatch[1] : null;
            stack.push({ tagName, line: lineIdx + 1, id, text: line.trim() });
        }
    }
}

console.log('Unclosed tags remaining in stack:');
stack.forEach(s => {
    console.log(`  <${s.tagName}${s.id ? ' id="' + s.id + '"' : ''}> opened at line ${s.line}`);
});
