const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('pos: 720945');
// find the occurrence near 720945
const chunk = html.slice(720900, 721800);
console.log(JSON.stringify(chunk));
