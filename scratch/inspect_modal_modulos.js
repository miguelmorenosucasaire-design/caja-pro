const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="form-notas"');
console.log('=== form-notas ===');
console.log(html.substring(idx - 300, idx + 800));

idx = html.indexOf('marcarTodosModulosModal');
console.log('=== marcarTodosModulosModal ===');
console.log(html.substring(idx - 100, idx + 800));
