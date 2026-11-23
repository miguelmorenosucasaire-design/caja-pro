const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const matches = [];
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('factura-estudiante') || l.includes('factura-nro-comprobante') || l.includes('factura-carrera') || l.includes('factura-monto')) {
    matches.push({ line: i + 1, text: l.trim() });
  }
});

console.log('Matches:');
matches.forEach(m => console.log(`L${m.line}: ${m.text}`));
