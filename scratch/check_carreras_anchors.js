const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const anchors = [
    { name: 'config-save-btn', text: 'id="config-status-msg"' },
    { name: 'section-carreras-body', text: '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="grid-carreras-reporte"></div>' },
    { name: 'modal-editar-docente-end', text: 'id="modal-editar-docente"' },
    { name: 'renderReporteCarreras-func', text: 'function renderReporteCarreras(carreras) {' },
    { name: 'cargarTodo-func', text: 'await cargarConfiguracion();' }
];

anchors.forEach(a => {
    const idx = content.indexOf(a.text);
    console.log(`${a.name}: ${idx !== -1 ? 'MATCHED at ' + idx : 'NOT FOUND'}`);
});
