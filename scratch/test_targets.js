const fs = require('fs');
let raw = fs.readFileSync('templates/index.html', 'utf8');
let html = raw.replace(/\r\n/g, '\n');

const checks = [
    { name: 'nav-docentes', str: '<!-- 9. DOCENTES -->' },
    { name: 'btn-nuevo-est', str: '<button onclick="abrirModalNuevoMovimiento(\'Estudiante\')"' },
    { name: 'modal-nef', str: '<div id="modal-nuevo-estudiante-factura"' },
    { name: 'modal-nef-carrera', str: '<select id="modal-nef-carrera"' },
    { name: 'tabla-carreras-config-body', str: '<tbody id="tabla-carreras-config-body"' },
    { name: 'modal-editar-grupo', str: '<div id="modal-editar-grupo"' },
    { name: 'guardarNuevoEstudianteConRecibo', str: 'async function guardarNuevoEstudianteConRecibo(' },
    { name: 'abrirModalNuevoEstudianteRecibo', str: 'function abrirModalNuevoEstudianteRecibo(' },
    { name: 'globals', str: 'let movimientosGlobales = [];' },
    { name: 'cargarDocentes', str: 'async function cargarDocentes(' },
    { name: 'cargarGrupos', str: 'async function cargarGrupos(' },
    { name: 'renderReporteCarreras', str: 'function renderReporteCarreras(' }
];

checks.forEach(c => {
    console.log(c.name, html.includes(c.str));
});
