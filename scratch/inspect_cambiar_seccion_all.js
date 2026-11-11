const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const fnIdx = html.indexOf('function cambiarSeccion');
const nextFn = html.indexOf('async function', fnIdx);
console.log(html.substring(fnIdx, nextFn));
