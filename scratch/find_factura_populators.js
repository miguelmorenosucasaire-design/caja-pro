const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes("poblarSelectorEstudiantesFactura") || l.includes("factura-estudiante-select") || l.includes("poblarSelectorRecibosOpciones")) {
    console.log((i+1) + ': ' + l);
  }
});
