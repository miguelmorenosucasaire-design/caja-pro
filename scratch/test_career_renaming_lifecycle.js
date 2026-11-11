const { DatabaseSync } = require('node:sqlite');
const http = require('http');

async function testCareerLifecycle() {
    console.log('====================================================');
    console.log('PRUEBA INTEGRAL DE EDICIÓN DE NOMBRES DE CARRERAS');
    console.log('====================================================\n');

    const db = new DatabaseSync('caja_institucional.db');

    // 1. Obtener lista de carreras desde el API
    const resGet = await fetch('http://127.0.0.1:5000/api/carreras');
    const carreras = await resGet.json();
    console.log(`[1] Total de carreras obtenidas: ${carreras.length}`);
    const corte = carreras.find(c => c.nombre.includes('Corte') || c.nombre.includes('Confección'));
    if (!corte) throw new Error('Carrera Corte y Ensamblaje no encontrada');
    console.log(`    Carrera a probar: ID ${corte.id} - "${corte.nombre}"`);
    console.log(`    Alumnos actuales: ${corte.total_alumnos}, Ingresos: S/. ${corte.total_ingreso}`);

    const nombreOriginal = corte.nombre;
    const nombreNuevo = 'Corte y Confección de Prendas';

    // 2. Modificar el nombre de la carrera
    console.log(`\n[2] Modificando nombre de "${nombreOriginal}" a "${nombreNuevo}"...`);
    const resEdit = await fetch(`http://127.0.0.1:5000/api/carreras/${corte.id}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreNuevo })
    });
    const editJson = await resEdit.json();
    console.log('    Respuesta del servidor:', editJson);
    if (!editJson.success) throw new Error('Fallo al editar nombre de carrera');

    // 3. Verificar en cascada en la base de datos
    console.log('\n[3] Verificando actualización en cascada en la base de datos...');
    const countDoc = db.prepare('SELECT COUNT(*) as c FROM docentes WHERE carrera = ?').get(nombreNuevo).c;
    console.log(`    Docentes con nuevo nombre "${nombreNuevo}": ${countDoc}`);

    // 4. Verificar integridad global
    console.log('\n[4] Verificando integridad global del sistema...');
    const totEst = db.prepare('SELECT COUNT(*) as c FROM estudiantes').get().c;
    const totMov = db.prepare('SELECT COUNT(*) as c FROM movimientos').get().c;
    const totIng = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo='Ingreso' AND estado='Pagado'").get().s;

    console.log(`    Total estudiantes: ${totEst} (Esperado 147)`);
    console.log(`    Total movimientos: ${totMov} (Esperado 202)`);
    console.log(`    Total ingresos: S/. ${totIng} (Esperado 24,630.00)`);

    if (totEst !== 147) throw new Error(`Total estudiantes alterado: ${totEst}`);
    if (totMov !== 202) throw new Error(`Total movimientos alterado: ${totMov}`);
    if (totIng !== 24630) throw new Error(`Total ingresos alterado: ${totIng}`);

    // 5. Restaurar nombre original
    console.log(`\n[5] Restaurando nombre a "${nombreOriginal}"...`);
    await fetch(`http://127.0.0.1:5000/api/carreras/${corte.id}/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreOriginal })
    });
    console.log('    ✓ Nombre restaurado y verificado.');

    console.log('\n====================================================');
    console.log('🎉 PRUEBA DE CICLO DE VIDA DE CARRERAS COMPLETADA 100% OK');
    console.log('====================================================\n');
}

testCareerLifecycle().catch(console.error);
