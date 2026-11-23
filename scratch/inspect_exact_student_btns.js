const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx1 = html.indexOf('function irAFacturaDesdeFichaEstudiante');
console.log('--- irAFacturaDesdeFichaEstudiante snippet ---');
console.log(html.substring(idx1 - 40, idx1 + 600));

const idx2 = html.indexOf('verFichaEstudiante(${e.id})');
console.log('--- verFichaEstudiante in card snippet ---');
console.log(html.substring(idx2 - 100, idx2 + 300));
