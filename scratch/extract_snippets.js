const fs = require('fs');
let html = fs.readFileSync('templates/index.html', 'utf8').replace(/\r\n/g, '\n');

function printSurrounding(str, len = 200) {
    const idx = html.indexOf(str);
    if (idx === -1) {
        console.log('NOT FOUND:', str);
        return;
    }
    console.log('--- FOUND:', str, '---');
    console.log(html.substring(Math.max(0, idx - 50), Math.min(html.length, idx + len)));
}

printSurrounding('<!-- 9. DOCENTES -->', 250);
printSurrounding('<button onclick="abrirModalNuevoMovimiento(\'Estudiante\')"', 200);
printSurrounding('<select id="modal-nef-carrera"', 300);
printSurrounding('<tbody id="tabla-carreras-config-body"', 300);
printSurrounding('async function guardarNuevoEstudianteConRecibo(', 400);
printSurrounding('function abrirModalNuevoEstudianteRecibo(', 250);
printSurrounding('let movimientosGlobales = [];', 150);
printSurrounding('async function cargarDocentes(', 300);
printSurrounding('async function cargarGrupos(', 300);
printSurrounding('function renderReporteCarreras(', 350);
