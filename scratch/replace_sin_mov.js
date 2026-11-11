const fs = require('fs');
const filePath = 'templates/index.html';
let s = fs.readFileSync(filePath, 'utf8');

s = s.replace(/⚪\s*Sin Movimiento/g, 'Sin Movimiento');
s = s.replace(/🟢\s*Superávit/g, 'Superávit');
s = s.replace(/🔴\s*Déficit/g, 'Déficit');
s = s.replace(/⚖️\s*En Equilibrio/g, 'En Equilibrio');

fs.writeFileSync(filePath, s, 'utf8');
console.log('✅ Cleaned up emojis in status badges successfully!');
