const fs = require('fs');
const svg = fs.readFileSync('scratch/recibo_svg_partes/00_recibo_completo.svg', 'utf8');
const lines = svg.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('<g id=')) {
    console.log(`Line ${idx+1}: ${l.trim()}`);
  }
});
