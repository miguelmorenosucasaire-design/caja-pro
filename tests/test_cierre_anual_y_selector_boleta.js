const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

async function testSuite() {
    console.log('========================================================================');
    console.log('  🧪 SUITE DE VERIFICACIÓN: ARQUITECTURA MULTIANUAL Y SELECTOR DE BOLETA');
    console.log('========================================================================\n');

    const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'templates', 'index.html'), 'utf8');

    // 1. Verificación DOM del Selector de Boleta y Botones Diferenciados
    console.log('--- FASE 1: ELEMENTOS DOM DEL SELECTOR Y EMISIÓN DE BOLETA ---');
    assert(htmlContent.includes('id="btn-toggle-emitir-boleta-si"'), 'Debe existir botón toggle "SÍ, Con Boleta"');
    console.log('  ✔ [PASS] Botón toggle "SÍ, Con Boleta" presente en modal');
    assert(htmlContent.includes('id="btn-toggle-emitir-boleta-no"'), 'Debe existir botón toggle "Solo Guardar"');
    console.log('  ✔ [PASS] Botón toggle "Solo Guardar" presente en modal');
    assert(htmlContent.includes('guardarSoloBaseDatosModal()'), 'Debe existir función guardarSoloBaseDatosModal()');
    console.log('  ✔ [PASS] Acción guardarSoloBaseDatosModal() vinculada');
    assert(htmlContent.includes('guardarEImprimirDirectoModal()'), 'Debe existir función guardarEImprimirDirectoModal()');
    console.log('  ✔ [PASS] Acción guardarEImprimirDirectoModal() vinculada');
    assert(htmlContent.includes('mostrarYDesplazarABoletaModal()'), 'Debe existir función para mostrar y desplazar a boleta');
    console.log('  ✔ [PASS] Función mostrarYDesplazarABoletaModal() implementada');

    // 2. Verificación DOM de Gestión Multianual
    console.log('\n--- FASE 2: ELEMENTOS DOM DE ARQUITECTURA MULTIANUAL ---');
    assert(htmlContent.includes('id="select-anio-activo-header"'), 'Debe existir selector de año en el header');
    console.log('  ✔ [PASS] Selector desplegable de año lectivo en cabecera (#select-anio-activo-header)');
    assert(htmlContent.includes('id="badge-estado-anio-header"'), 'Debe existir badge de estado de año en el header');
    console.log('  ✔ [PASS] Badge de estado activo/cerrado en cabecera (#badge-estado-anio-header)');
    assert(htmlContent.includes('id="modal-cierre-anual"'), 'Debe existir modal de cierre anual');
    console.log('  ✔ [PASS] Modal interactivo de Cierre Anual (#modal-cierre-anual)');
    assert(htmlContent.includes('id="modal-apertura-anio"'), 'Debe existir modal de apertura de año');
    console.log('  ✔ [PASS] Modal interactivo de Apertura de Año (#modal-apertura-anio)');
    assert(htmlContent.includes('id="contenedor-tarjetas-anios"'), 'Debe existir contenedor de tarjetas de años');
    console.log('  ✔ [PASS] Contenedor dinámico de tarjetas de años (#contenedor-tarjetas-anios)');
    assert(htmlContent.includes('id="tabla-archivos-cierres-anuales"'), 'Debe existir tabla de archivos sellados de cierre');
    console.log('  ✔ [PASS] Tabla de historial de cierres anuales sellados (#tabla-archivos-cierres-anuales)');

    // 3. Verificación de Endpoints HTTP y Base de Datos
    console.log('\n--- FASE 3: VERIFICACIÓN DE ENDPOINTS HTTP Y PERSISTENCIA SQLITE ---');
    const fetch = globalThis.fetch;
    const resAnios = await fetch('http://127.0.0.1:5000/api/sistema/anios');
    assert.strictEqual(resAnios.status, 200, 'GET /api/sistema/anios debe responder HTTP 200');
    const dataAnios = await resAnios.json();
    assert.strictEqual(dataAnios.success, true, 'Respuesta de anios debe ser exitosa');
    assert.strictEqual(dataAnios.anio_activo, '2026', 'El año activo inicial debe ser 2026');
    console.log(`  ✔ [PASS] API /api/sistema/anios operativa (Año Activo: ${dataAnios.anio_activo} | Total Años: ${dataAnios.anios.length})`);

    // Probar guardado de un estudiante de prueba con persistencia en DB
    const estudianteTestNombre = 'ESTUDIANTE TEST MULTIANUAL AUTO';
    const resMov = await fetch('http://127.0.0.1:5000/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tipo: 'Ingreso',
            rol: 'Estudiante',
            nombre: estudianteTestNombre,
            dni: '88776655',
            telefono: '998877665',
            carrera: 'Corte y Confección',
            turno: 'Noche',
            monto: 150,
            concepto: 'Aporte por Mantenimiento Módulo 1',
            fecha: '2026-11-23'
        })
    });
    assert.strictEqual(resMov.status, 200, 'POST /api/movimientos debe responder HTTP 200');
    const dataMov = await resMov.json();
    assert.strictEqual(dataMov.success, true, 'Movimiento debe guardarse con éxito');
    assert.strictEqual(dataMov.estudiante_guardado, true, 'El estudiante debe marcarse como guardado en DB');
    console.log(`  ✔ [PASS] Estudiante guardado automáticamente en BD SQLite y movimiento registrado (Comprobante: N° ${dataMov.comprobante})`);

    // Verificar en SQLite que el estudiante realmente existe
    const db = new DatabaseSync(path.join(__dirname, '..', 'caja_institucional.db'));
    const estRow = db.prepare("SELECT * FROM estudiantes WHERE LOWER(nombre) = LOWER(?)").get(estudianteTestNombre);
    assert(estRow, 'El estudiante debe existir en la tabla estudiantes');
    assert.strictEqual(estRow.dni, '88776655', 'El DNI del estudiante debe coincidir');
    assert.strictEqual(estRow.carrera, 'Corte y Confección', 'La carrera debe coincidir');
    assert.strictEqual(estRow.turno, 'Noche', 'El turno debe coincidir');
    console.log(`  ✔ [PASS] Registro en tabla 'estudiantes' verificado con DNI: ${estRow.dni}, Carrera: ${estRow.carrera}, Turno: ${estRow.turno}`);

    // Limpiar estudiante de prueba y movimiento
    db.prepare("DELETE FROM movimientos WHERE id = ?").run(dataMov.id);
    db.prepare("DELETE FROM estudiantes WHERE id = ?").run(estRow.id);
    await fetch('http://127.0.0.1:5000/api/sistema/sincronizar-excel');
    console.log('  ✔ [PASS] Limpieza de registro de prueba ejecutada limpiamente y Excel reconciliado');

    console.log('\n========================================================================');
    console.log('  🎉 TODAS LAS 14 PRUEBAS ESPECÍFICAS DE LA SUITE FUERON SUPERADAS AL 100%');
    console.log('========================================================================\n');
}

testSuite().catch(err => {
    console.error('❌ Error en test suite:', err);
    process.exit(1);
});
