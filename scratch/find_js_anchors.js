const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const targets = [
    'function poblarSelectorGruposFactura',
    'function seleccionarGrupoFactura',
    'function seleccionarEstudianteFactura',
    'function poblarSelectorRecibosOpciones',
    'function seleccionarFacturaRecibo'
];

targets.forEach(t => {
    const idx = html.indexOf(t);
    console.log(t, 'is at index:', idx);
});
