const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const bodyIdx = html.indexOf('<body');
const mainIdx = html.indexOf('<main');
console.log(html.substring(bodyIdx, mainIdx + 70));
