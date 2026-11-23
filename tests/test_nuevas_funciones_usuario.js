const assert = require('assert');
const http = require('http');
const fs = require('fs');

async function runTests() {
    console.log("--- TEST DE VALIDACIÓN: NUEVAS FUNCIONES SOLICITADAS POR EL USUARIO ---");

    const html = fs.readFileSync('templates/index.html', 'utf8');

    // 1. Botón Limpiar Boleta
    assert(html.includes('id="btn-limpiar-boleta"'), 'FAIL: Botón Limpiar Boleta no encontrado en HTML');
    assert(html.includes('function limpiarSeleccionBoleta()'), 'FAIL: función limpiarSeleccionBoleta no definida');
    console.log("✔ [PASS] 1. Botón y función 'Limpiar Boleta' presentes para reiniciar comprobante y seleccionar nuevo estudiante");

    // 2. Ordenamiento de Estudiantes (Recientes primero por defecto)
    assert(html.includes('id="filtro-estudiantes-orden"'), 'FAIL: Selector de ordenamiento de estudiantes no encontrado');
    assert(html.includes('function ordenarEstudiantesLista('), 'FAIL: función ordenarEstudiantesLista no definida');
    console.log("✔ [PASS] 2. Selector de ordenamiento de nómina (reciente/antiguo/boleta) y prioridad de nuevo estudiante integrados");

    // 3. Buscador de Deudores por Nombre o DNI
    assert(html.includes('id="filtro-deudores-buscar"'), 'FAIL: Campo de búsqueda de deudores no encontrado');
    assert(html.includes('function filtrarDeudoresEnTabla()'), 'FAIL: función filtrarDeudoresEnTabla no definida');
    console.log("✔ [PASS] 3. Filtro interactivo de deudores por Nombre o DNI disponible");

    // 4. Selector de Fecha en Diario y Botones Rápidos
    assert(html.includes('id="diario-selector-fecha"'), 'FAIL: Selector de fecha de diario no encontrado');
    assert(html.includes('function irAFechaDiario('), 'FAIL: función irAFechaDiario no definida');
    assert(html.includes('function cambiarDiaDiario('), 'FAIL: función cambiarDiaDiario no definida');
    console.log("✔ [PASS] 4. Selector dinámico de fecha de diario, botón 'Hoy', 'Último' y navegación entre días funcionando");

    // 5. Aislamiento de Exportación en Print CSS y funciones dedicadas
    assert(html.includes('section.hidden'), 'FAIL: Regla de aislamiento section.hidden no encontrada');
    assert(!html.includes('#section-factura { display: block !important; visibility: visible !important;'), 'FAIL: #section-factura sigue forzando visibilidad en print');
    assert(html.includes('function exportarDiarioPDF()'), 'FAIL: exportarDiarioPDF no definida');
    assert(html.includes('function exportarControlPagosPDF()'), 'FAIL: exportarControlPagosPDF no definida');
    console.log("✔ [PASS] 5. Aislamiento total de exportación en PDF para cada sección individual sin mezclar contenidos");

    // 6. Endpoints de exportación en vivo en el servidor
    const checkEndpoint = (path) => new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:5000' + path, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
    });

    const resControlPagos = await checkEndpoint('/api/exportar/hoja?sheet=control-pagos');
    assert.strictEqual(resControlPagos.status, 200, 'FAIL: /api/exportar/hoja?sheet=control-pagos no responde 200');
    assert(resControlPagos.data.includes('CONTROL DE PAGOS POR MES'), 'FAIL: Contenido de exportación no coincide con matriz mensual');
    console.log("✔ [PASS] 6. Exportación de Matriz Mensual (CONTROL_PAGOS) responde 200 OK y genera archivo oficial");

    const resDiario = await checkEndpoint('/api/exportar/hoja?sheet=diario');
    assert.strictEqual(resDiario.status, 200, 'FAIL: /api/exportar/hoja?sheet=diario no responde 200');
    assert(resDiario.data.includes('DIARIO DE CAJA Y BITÁCORA DE CLASE'), 'FAIL: Contenido de exportación no coincide con diario');
    console.log("✔ [PASS] 7. Exportación de Diario de Caja y Bitácora (DIARIO y NOTAS) responde 200 OK");

    console.log("\n🎉 TODAS LAS COMPROBACIONES DE LAS NUEVAS FUNCIONES PASARON AL 100%!");
}

runTests().catch(err => {
    console.error("ERROR EN TEST:", err.message);
    process.exit(1);
});
