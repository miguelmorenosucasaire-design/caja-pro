const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\MIGUEL\\Downloads\\ReciboIngresos.jsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(10, 185).join('\n'));
