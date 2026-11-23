const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('id="form-concepto"');
console.log('=== form-concepto ===');
console.log(html.substring(idx - 200, idx + 800));
