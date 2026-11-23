const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const matches = [];
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderizarEstudiantes') || l.includes('cargarEstudiantes') || l.includes('irAFacturaDesdeFichaEstudiante') || l.includes('verFichaEstudiante')) {
    matches.push({ line: i + 1, text: l.trim() });
  }
});

console.log('Matches:');
matches.forEach(m => console.log(`L${m.line}: ${m.text}`));
