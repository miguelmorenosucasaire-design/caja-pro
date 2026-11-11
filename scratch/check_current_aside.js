const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('Does html have section-configuracion?', html.includes('id="section-configuracion"'));
console.log('Does html have nav-dashboard?', html.includes('id="nav-dashboard"'));
console.log('Does html have nav-configuracion?', html.includes('id="nav-configuracion"'));

const asideStart = html.indexOf('<aside');
const asideEnd = html.indexOf('</aside>') + 8;
console.log('\n--- ASIDE SNIPPET ---');
console.log(html.substring(asideStart, asideEnd));
