const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const htmlTagMatch = html.match(/<html[^>]*>/i);
console.log('HTML tag:', htmlTagMatch ? htmlTagMatch[0] : 'not found');

const bodyTagMatch = html.match(/<body[^>]*>/i);
console.log('BODY tag:', bodyTagMatch ? bodyTagMatch[0] : 'not found');

const initThemeIdx = html.indexOf('function initTheme');
console.log('initTheme snippet:\n', html.substring(initThemeIdx, initThemeIdx + 300));
