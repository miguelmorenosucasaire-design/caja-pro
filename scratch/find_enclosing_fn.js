const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf("document.getElementById('tabla-resultados-dedicada')");
console.log('Index:', idx);
const before = html.substring(Math.max(0, idx - 2000), idx);
const fnMatch = before.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
console.log('Preceding functions:', fnMatch);
