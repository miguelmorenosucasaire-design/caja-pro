const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const matches = [];
const regex = /function (cargarGrupos|renderGrupos|abrirModal|verPlantilla|guardar|eliminar)[a-zA-Z0-9_]*/g;
let m;
while ((m = regex.exec(html)) !== null) {
    matches.push(m[0]);
}
console.log('Found functions:', matches);

const idx = html.indexOf('function cargarGrupos');
if (idx > -1) {
    console.log('\n--- cargarGrupos code ---');
    console.log(html.substring(idx, idx + 2500));
}
