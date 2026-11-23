const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const fnIdx = html.indexOf('async function descargarBoletaModalDirecta');
const nextFnIdx = html.indexOf('function reiniciarModalParaSiguiente', fnIdx);
console.log('Fn from', fnIdx, 'to', nextFnIdx);
console.log(html.substring(fnIdx, nextFnIdx));
