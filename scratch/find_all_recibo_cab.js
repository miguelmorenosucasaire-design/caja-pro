const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('recibo__cab')) {
    console.log(`L${i + 1}: ${l}`);
  }
});
