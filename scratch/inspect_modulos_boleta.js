const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('function insertarNotaRapida');
console.log('=== insertarNotaRapida ===');
console.log(html.substring(idx - 100, idx + 800));

idx = html.indexOf('modal-box-mod-1');
console.log('=== modal-box-mod-1 ===');
console.log(html.substring(idx - 100, idx + 800));
