const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('<header');
const end = html.indexOf('</header>');
console.log('--- TOP HEADER ---');
console.log(html.substring(start, end + 9));
