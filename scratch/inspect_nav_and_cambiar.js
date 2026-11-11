const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const navStart = html.indexOf('<aside');
const navEnd = html.indexOf('</aside>');
console.log('--- SIDEBAR LINKS ---');
console.log(html.substring(navStart, navEnd));

const fnIdx = html.indexOf('function cambiarSeccion');
console.log('\n--- cambiarSeccion function ---');
console.log(html.substring(fnIdx, fnIdx + 1200));
