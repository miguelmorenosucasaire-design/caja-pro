const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const match = html.match(/function cambiarSeccion[\s\S]*?\n\s*\}/);
console.log(match ? match[0] : 'not found');
