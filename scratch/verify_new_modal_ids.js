const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const checks = [
    'modal-asignar-carrera-titulo',
    'modal-asignar-carrera-subtitulo',
    'asignar-carrera-estudiante-actual',
    'modal-asignar-carrera-btn-label',
    'poblarSelectCarreraEnModal',
    'Modificar / Cambiar Carrera'
];

checks.forEach(c => {
    console.log(html.includes(c) ? '✅' : '❌', c);
});
