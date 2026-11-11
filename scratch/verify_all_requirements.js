const fs = require('fs');

console.log('=== VERIFICANDO REQUISITOS EN TEMPLATES/INDEX.HTML ===');
const html = fs.readFileSync('templates/index.html', 'utf8');

const checks = [
    { name: 'Formato Doble Media Carta button', target: 'id="btn-formato-doble"' },
    { name: 'Formato Simple button', target: 'id="btn-formato-simple"' },
    { name: 'Estilo Color button', target: 'id="btn-estilo-color"' },
    { name: 'Estilo Azul button', target: 'id="btn-estilo-azul"' },
    { name: 'Fecha de Emisión Input', target: 'id="factura-fecha-emision-input"' },
    { name: 'Botón Emitir a Nuevo Alumno Hoy', target: 'abrirModalNuevoEstudianteRecibo()' },
    { name: 'Botón Calendarización de Ingresos', target: 'abrirModalCalendarizacion()' },
    { name: 'Botón Guardar Recibo en Excel (.xlsx)', target: 'descargarReciboExcel()' },
    { name: 'Comprobante Original Container', target: 'id="contenedor-comprobante-oficial"' },
    { name: 'Separador Corte Talonario', target: 'id="separador-corte-talonario"' },
    { name: 'Comprobante Copia Container', target: 'id="contenedor-comprobante-copia"' },
    { name: 'Estilo CSS Tinta Azul (.voucher-estilo-azul)', target: '.voucher-estilo-azul' },
    { name: 'CSS Media Print Media Carta', target: '.voucher-media-carta' },
    { name: 'Modal Nuevo Estudiante Recibo', target: 'id="modal-nuevo-estudiante-factura"' },
    { name: 'Modal Calendarización Ingresos', target: 'id="modal-calendarizacion-ingresos"' },
    { name: 'Función setFormatoVoucher', target: 'function setFormatoVoucher' },
    { name: 'Función setEstiloVoucher', target: 'function setEstiloVoucher' },
    { name: 'Función descargarReciboExcel', target: 'function descargarReciboExcel' },
    { name: 'Función cambiarFechaEmisionFactura', target: 'function cambiarFechaEmisionFactura' },
    { name: 'Función guardarNuevoEstudianteConRecibo', target: 'function guardarNuevoEstudianteConRecibo' },
    { name: 'Función cargarCalendarizacion', target: 'function cargarCalendarizacion' },
    { name: 'Función sincronizarCopiaVoucher', target: 'function sincronizarCopiaVoucher' },
    { name: 'Pills badge count 176 (Todas)', target: 'id="badge-count-fac-todas"' },
    { name: 'Pills badge count 33 (Confección)', target: 'id="badge-count-fac-corte"' },
    { name: 'Pills badge count 62 (Computación)', target: 'id="badge-count-fac-computacion"' },
    { name: 'Pills badge count 51 (Cosmetología)', target: 'id="badge-count-fac-peluqueria"' }
];

let allPassed = true;
checks.forEach(c => {
    const passed = html.includes(c.target);
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${c.name}`);
    if (!passed) allPassed = false;
});

if (allPassed) {
    console.log('\n>>> TODOS LOS REQUISITOS EN TEMPLATES/INDEX.HTML VERIFICADOS AL 100%! <<<');
} else {
    console.log('\n>>> ALGUNOS ELEMENTOS FALTAN EN TEMPLATES/INDEX.HTML <<<');
    process.exit(1);
}
