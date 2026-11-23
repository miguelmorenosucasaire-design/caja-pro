const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('HTML length:', html.length);
console.log('nav-docentes hidden:', html.includes('id="nav-docentes" style="display:none !important;"'));
console.log('modal-nef-docente exists:', html.includes('id="modal-nef-docente"'));
console.log('tabla-docentes-grupos-config-body exists:', html.includes('id="tabla-docentes-grupos-config-body"'));
console.log('modal-editar-docente-grupo exists:', html.includes('id="modal-editar-docente-grupo"'));
console.log('guardarModificacionDocenteGrupo exists:', html.includes('function guardarModificacionDocenteGrupo('));
console.log('poblarSelectDocentesNuevoEstudiante exists:', html.includes('function poblarSelectDocentesNuevoEstudiante('));
