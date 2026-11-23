const fs = require('fs');
let html = fs.readFileSync('templates/index.html', 'utf8');

// In abrirModalNuevoMovimiento:
if (html.includes('function abrirModalNuevoMovimiento(rolPreseleccionado = \'\') {')) {
    html = html.replace('function abrirModalNuevoMovimiento(rolPreseleccionado = \'\') {', 'function abrirModalNuevoMovimiento(rolPreseleccionado = \'\') {\n            if (typeof cargarConceptosPersonalizadosEnSelector === \'function\') cargarConceptosPersonalizadosEnSelector();');
    console.log('cargarConceptosPersonalizadosEnSelector conectado en abrirModalNuevoMovimiento.');
}

// In cargarCalendarizacionDiario:
if (html.includes('calendarizacionGlobal = calendarizacion;')) {
    html = html.replace('calendarizacionGlobal = calendarizacion;', 'calendarizacionGlobal = calendarizacion;\n                if (typeof renderizarMiniCalendarioGrid === \'function\') renderizarMiniCalendarioGrid();');
    console.log('renderizarMiniCalendarioGrid conectado en cargarCalendarizacionDiario.');
}

fs.writeFileSync('templates/index.html', html, 'utf8');
