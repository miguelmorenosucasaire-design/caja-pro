const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const asideStart = html.indexOf('<aside');
const asideEnd = html.indexOf('</aside>') + 8;
console.log('--- CURRENT ASIDE ---');
console.log(html.substring(asideStart, asideEnd));

const headerStart = html.indexOf('<header');
const headerEnd = html.indexOf('</header>') + 9;
console.log('\n--- CURRENT HEADER ---');
console.log(html.substring(headerStart, headerEnd));
