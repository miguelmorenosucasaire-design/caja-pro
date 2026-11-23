const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const secIdx = html.indexOf('id="seccion-estudiantes"');
const endSecIdx = html.indexOf('id="seccion-grupos"', secIdx);
const studentSecHtml = html.substring(secIdx, endSecIdx !== -1 ? endSecIdx : secIdx + 15000);

const lines = studentSecHtml.split('\n');
lines.forEach((l, i) => {
  if (l.toLowerCase().includes('boleta') || l.toLowerCase().includes('imprimir') || l.toLowerCase().includes('factura')) {
    console.log(`L${i+1}: ${l.trim()}`);
  }
});
