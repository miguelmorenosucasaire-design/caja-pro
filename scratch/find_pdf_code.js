const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const matches = [];
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('html2pdf') || line.includes('descargar') || line.includes('.save(') || line.includes('pdf') || line.includes('guardarBoleta')) {
    matches.push({ line: idx + 1, text: line.trim() });
  }
});

console.log('Matches count:', matches.length);
matches.slice(0, 30).forEach(m => console.log(`L${m.line}: ${m.text}`));
