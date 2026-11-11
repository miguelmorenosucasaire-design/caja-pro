const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('async function seleccionarSeccionSidebar(');
console.log(content.slice(idx, idx + 4000));
