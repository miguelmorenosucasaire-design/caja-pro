const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('function setConceptoRapidoModal');
console.log(html.substring(idx - 100, idx + 1000));
