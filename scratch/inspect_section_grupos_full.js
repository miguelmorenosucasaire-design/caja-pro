const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="section-grupos"');
const nextSection = html.indexOf('id="section-', start + 25);
console.log('--- SECTION GRUPOS HTML ---');
console.log(html.substring(start - 20, nextSection > 0 ? nextSection - 30 : start + 4000));
