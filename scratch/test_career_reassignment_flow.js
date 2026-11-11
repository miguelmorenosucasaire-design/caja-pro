const { DatabaseSync } = require('node:sqlite');

async function testReassignmentLifecycle() {
    console.log('====================================================');
    console.log('PRUEBA DE FLUJO: ASIGNAR Y MODIFICAR / CAMBIAR CARRERA');
    console.log('====================================================\n');

    const db = new DatabaseSync('caja_institucional.db');

    // 1. Tomar el primer estudiante
    const resEst = await fetch('http://127.0.0.1:5000/api/estudiantes');
    const estudiantes = await resEst.json();
    const target = estudiantes[0];
    console.log(`[1] Estudiante a probar: ID ${target.id} - "${target.nombre}"`);
    console.log(`    Carrera inicial: "${target.carrera}"`);

    // 2. Asignar por primera vez a 'Mecánica Automotriz'
    console.log('\n[2] Asignando a "Mecánica Automotriz"...');
    const res1 = await fetch(`http://127.0.0.1:5000/api/estudiantes/${target.id}/asignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            carrera: 'Mecánica Automotriz',
            grupo: 'General'
        })
    });
    const json1 = await res1.json();
    console.log('    Respuesta:', json1);
    if (!json1.success) throw new Error('Fallo al asignar carrera');

    // Verificar en DB
    let estRow = db.prepare('SELECT carrera, grupo FROM estudiantes WHERE id = ?').get(target.id);
    let movCount = db.prepare('SELECT COUNT(*) as c FROM movimientos WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND carrera = ?').get(target.nombre, 'Mecánica Automotriz').c;
    console.log(`    ✓ DB Estudiante carrera: "${estRow.carrera}"`);
    console.log(`    ✓ DB Movimientos sincronizados con "Mecánica Automotriz": ${movCount}`);
    if (estRow.carrera !== 'Mecánica Automotriz') throw new Error('Carrera no coincide en DB');

    // 3. MODIFICAR / CAMBIAR CARRERA a 'Computación e Informática'
    console.log('\n[3] MODIFICANDO / CAMBIANDO CARRERA a "Computación e Informática"...');
    const res2 = await fetch(`http://127.0.0.1:5000/api/estudiantes/${target.id}/asignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            carrera: 'Computación e Informática',
            grupo: 'General'
        })
    });
    const json2 = await res2.json();
    console.log('    Respuesta:', json2);
    if (!json2.success) throw new Error('Fallo al cambiar carrera');

    // Verificar en DB
    estRow = db.prepare('SELECT carrera, grupo FROM estudiantes WHERE id = ?').get(target.id);
    movCount = db.prepare('SELECT COUNT(*) as c FROM movimientos WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND carrera = ?').get(target.nombre, 'Computación e Informática').c;
    console.log(`    ✓ DB Estudiante carrera cambiada a: "${estRow.carrera}"`);
    console.log(`    ✓ DB Movimientos actualizados con "Computación e Informática": ${movCount}`);
    if (estRow.carrera !== 'Computación e Informática') throw new Error('Carrera modificada no coincide en DB');

    // 4. REVERTIR a 'Sin Asignar (Pendiente)'
    console.log('\n[4] REVIRTIENDO a "Sin Asignar (Pendiente)"...');
    const res3 = await fetch(`http://127.0.0.1:5000/api/estudiantes/${target.id}/asignar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            carrera: 'Sin Asignar (Pendiente)',
            grupo: 'Sin Asignar'
        })
    });
    const json3 = await res3.json();
    console.log('    Respuesta:', json3);
    if (!json3.success) throw new Error('Fallo al revertir a Sin Asignar');

    estRow = db.prepare('SELECT carrera, grupo FROM estudiantes WHERE id = ?').get(target.id);
    console.log(`    ✓ DB Estudiante carrera revertida a: "${estRow.carrera}"`);

    // 5. Verificar Integridad Global
    console.log('\n[5] Verificando Integridad Contable...');
    const totEst = db.prepare('SELECT COUNT(*) as c FROM estudiantes').get().c;
    const totMov = db.prepare('SELECT COUNT(*) as c FROM movimientos').get().c;
    const totIng = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo='Ingreso' AND estado='Pagado'").get().s;

    console.log(`    Total estudiantes: ${totEst} (Esperado: 147)`);
    console.log(`    Total movimientos: ${totMov} (Esperado: 202)`);
    console.log(`    Total ingresos: S/. ${totIng} (Esperado: 24630.00)`);

    if (totEst !== 147 || totMov !== 202 || totIng !== 24630) {
        throw new Error('Inconsistencia contable');
    }

    // 6. Sincronización con Excel
    const resExcel = await fetch('http://127.0.0.1:5000/api/exportar/excel');
    console.log(`    ✓ Excel status: ${resExcel.status}, tamaño: ${resExcel.headers.get('content-length')} bytes`);

    console.log('\n====================================================');
    console.log('🎉 PRUEBA DE ASIGNAR Y CAMBIAR CARRERA PASÓ AL 100%');
    console.log('====================================================\n');
}

testReassignmentLifecycle().catch(console.error);
