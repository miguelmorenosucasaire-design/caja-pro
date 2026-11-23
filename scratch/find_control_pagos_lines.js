const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
lines.forEach((l, idx) => {
  if (l.includes('section-control-pagos') || l.includes('tabla-control-pagos-body')) {
    console.log(`${idx + 1}: ${l.slice(0, 100)}`);
  }
});
