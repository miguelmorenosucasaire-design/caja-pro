const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('HTML total size:', html.length, 'characters');
const sections = [...html.matchAll(/id="section-([a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
console.log('Sections in HTML:', sections);

const asideStart = html.indexOf('<aside');
const asideEnd = html.indexOf('</aside>') + 8;
console.log('Aside length:', asideEnd - asideStart);

const headerStart = html.indexOf('<header');
const headerEnd = html.indexOf('</header>') + 9;
console.log('Header length:', headerEnd - headerStart);
