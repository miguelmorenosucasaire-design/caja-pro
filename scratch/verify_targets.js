const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const checks = [
    { name: 'nav-respaldos', target: 'id="nav-respaldos"' },
    { name: 'sheet-tab-respaldos', target: 'id="sheet-tab-respaldos"' },
    { name: 'top-nav-respaldos', target: 'id="top-nav-respaldos"' },
    { name: 'top-badge-grupos', target: 'id="top-badge-grupos">6<' },
    { name: 'section-grupos banner', target: '<span>Organización Académica • 13 Secciones Oficiales • CETPRO San Miguel</span>' },
    { name: 'vista-plantilla-seccion', target: 'id="vista-plantilla-seccion"' },
    { name: 'factura-membrete', target: 'Teléfono: (01) 566-2390 · Correo: cetpro_micaelabastidas@educacion.gob.pe' },
    { name: 'main tag end', target: '</main>' },
    { name: 'cambiarSeccion func', target: "const secciones = ['dashboard', 'resultados', 'caja', 'estudiantes', 'docentes', 'grupos', 'deudores', 'carreras', 'respaldos', 'control-pagos', 'diario', 'factura'];" },
    { name: 'cargarTodo func', target: 'async function cargarTodo() {' }
];

checks.forEach(c => {
    const idx = content.indexOf(c.target);
    console.log(`${c.name}: ${idx !== -1 ? 'MATCHED at ' + idx : 'NOT FOUND'}`);
});
