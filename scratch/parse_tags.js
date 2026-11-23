const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const s = html.indexOf('id="contenedor-comprobante-oficial"');
const e = html.indexOf('id="separador-corte-talonario"');
const snippet = html.substring(s, e);

// Parse tags
const tagRegex = /<\/?([a-zA-Z0-9]+)(\s+[^>]*)?>/g;
let match;
const stack = [];
let errorFound = false;

while ((match = tagRegex.exec(snippet)) !== null) {
  const fullTag = match[0];
  const tagName = match[1].toLowerCase();
  const isClosing = fullTag.startsWith('</');
  const isSelfClosing = fullTag.endsWith('/>') || ['img', 'input', 'br', 'hr', 'rect', 'path', 'svg'].includes(tagName);

  if (tagName === 'svg') {
    if (isClosing) {
      const top = stack.pop();
      if (top !== 'svg') console.log('Mismatch svg closing:', top);
    } else {
      stack.push('svg');
    }
    continue;
  }
  if (['rect', 'path'].includes(tagName)) continue;

  if (isClosing) {
    const top = stack.pop();
    if (top !== tagName) {
      console.log(`Tag mismatch: closed </${tagName}>, but expected </${top}>`);
      errorFound = true;
    }
  } else if (!isSelfClosing) {
    stack.push(tagName);
  }
}

console.log('Unclosed tags remaining in Oficial:', stack);
