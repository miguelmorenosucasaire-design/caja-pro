const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const lines = html.split('\n');

console.log('--- Searching modal-nuevo-movimiento ---');
lines.forEach((l, idx) => {
  if (l.includes('modal-nuevo-movimiento')) {
    console.log(`${idx + 1}: ${l.slice(0, 100)}`);
  }
});

console.log('--- Dark mode CSS search ---');
lines.forEach((l, idx) => {
  if (l.includes('.dark header') || l.includes('.dark h1') || l.includes('talonario-modal-hoja')) {
    console.log(`${idx + 1}: ${l.slice(0, 100)}`);
  }
});
