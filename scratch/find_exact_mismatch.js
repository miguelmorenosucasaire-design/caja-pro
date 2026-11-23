const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const s = html.indexOf('id="contenedor-comprobante-oficial"');
const e = html.indexOf('id="separador-corte-talonario"');
const snippet = html.substring(s, e);

const lines = snippet.split('\n');
const stack = [];

lines.forEach((line, lineIdx) => {
  const tagRegex = /<\/?([a-zA-Z0-9]+)(\s+[^>]*)?>/g;
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || ['img', 'input', 'br', 'hr', 'rect', 'path'].includes(tagName);
    if (['rect', 'path'].includes(tagName)) continue;

    if (isClosing) {
      if (stack.length === 0) {
        console.log(`Line ${lineIdx + 1}: EXTRA CLOSING </${tagName}>: ${line.trim()}`);
      } else {
        const top = stack.pop();
        if (top.tag !== tagName) {
          console.log(`Line ${lineIdx + 1}: Mismatch! Closed </${tagName}> but top was <${top.tag}> from line ${top.line}`);
        }
      }
    } else if (!isSelfClosing) {
      stack.push({ tag: tagName, line: lineIdx + 1, text: line.trim() });
    }
  }
});

console.log('Remaining open tags:');
stack.forEach(s => console.log(`  <${s.tag}> from line ${s.line}`));
