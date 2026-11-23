const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const matches = [];
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('imprimir') && (l.includes('estudiante') || l.includes('alumno') || l.includes('Boleta') || l.includes('boleta'))) {
    matches.push({ line: i + 1, text: l.trim() });
  }
  if (l.includes('abrirModal') || l.includes('verBoleta') || l.includes('cargarBoleta') || l.includes('cargarEstudiante')) {
    matches.push({ line: i + 1, text: l.trim() });
  }
});

console.log('Matches count:', matches.length);
matches.slice(0, 30).forEach(m => console.log(`L${m.line}: ${m.text}`));
