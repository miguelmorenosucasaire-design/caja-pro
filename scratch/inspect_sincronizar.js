const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');
const lines = content.split('\n');

const idx = lines.findIndex(l => l.includes('function sincronizarCopiaVoucher'));
console.log(lines.slice(idx, idx + 50).join('\n'));
