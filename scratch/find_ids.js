const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const matches = html.match(/id="factura-[a-zA-Z0-9_-]+"/g) || [];
console.log('Factura IDs found:', [...new Set(matches)]);
