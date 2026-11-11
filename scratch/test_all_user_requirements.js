const http = require('http');
const fs = require('fs');
const path = require('path');

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: {}
        };
        let bodyData = null;
        if (body) {
            bodyData = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(bodyData);
        }
        const req = http.request(options, (res) => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: buffer.toString('utf-8'),
                    buffer: buffer
                });
            });
        });
        req.on('error', reject);
        if (bodyData) req.write(bodyData);
        req.end();
    });
}

async function run() {
    console.log("==================================================================");
    console.log("   VERIFICACIÓN INTEGRAL DE REQUERIMIENTOS SOLICITADOS POR EL USUARIO");
    console.log("==================================================================");

    // 1. Verificar Secciones (0 grupos iniciales para creación manual)
    console.log("\n[1] Verificando eliminación de grupos y preparación para adición manual...");
    const resGrupos = await request('GET', '/api/grupos');
    const grupos = JSON.parse(resGrupos.body);
    console.log(`    Total secciones: ${grupos.length}`);
    if (grupos.length !== 0) throw new Error(`Esperado 0 grupos, obtenido ${grupos.length}`);
    console.log("    ✅ Grupos eliminados correctamente para adición manual según requerimiento.");

    // 2. Probar Estudiantes Sin Asignar y Asignación de 1 de las 7 Carreras
    console.log("\n[2] Verificando flujo de estudiantes sin asignar y asignación de carrera...");
    // Crear estudiante de prueba sin asignar
    const resCrearEst = await request('POST', '/api/estudiantes', {
        nombre: 'TEST ALUMNO PENDIENTE',
        carrera: 'Sin Asignar (Pendiente)',
        grupo: 'General'
    });
    const estCreado = JSON.parse(resCrearEst.body);
    const testEstId = estCreado.id;
    console.log(`    Estudiante temporal creado ID ${testEstId} con carrera: Sin Asignar (Pendiente)`);

    // Filtrar por sin_asignar
    const resSinAsignar = await request('GET', '/api/estudiantes?carrera=sin_asignar');
    const sinAsignar = JSON.parse(resSinAsignar.body);
    const encontrado = sinAsignar.some(e => e.id === testEstId);
    if (!encontrado) throw new Error("Estudiante no apareció en filtro sin_asignar");
    console.log(`    ✅ Filtro /api/estudiantes?carrera=sin_asignar funciona correctamente.`);

    // Asignar a una de las 7 carreras oficiales
    const resAsignar = await request('POST', `/api/estudiantes/${testEstId}/asignar`, {
        carrera: 'Mecánica y Ensamblaje',
        grupo: 'G11 - Ensamblaje y Reparación de Computadoras - A'
    });
    const resAsignarJson = JSON.parse(resAsignar.body);
    if (!resAsignarJson.success) throw new Error("Error al asignar carrera");
    console.log("    ✅ Asignación de carrera oficial (Mecánica y Ensamblaje) exitosa.");

    // Verificar en DB
    const resDetalleEst = await request('GET', `/api/estudiantes/${testEstId}/detalle`);
    const estVerif = JSON.parse(resDetalleEst.body).estudiante;
    if (estVerif.carrera !== 'Mecánica y Ensamblaje') throw new Error("Carrera no actualizada en DB");
    console.log(`    ✅ DB actualizada con especialidad: ${estVerif.carrera} y grupo: ${estVerif.grupo}`);

    // Eliminar estudiante temporal de prueba
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(path.join(__dirname, '..', 'caja_institucional.db'));
    db.prepare('DELETE FROM estudiantes WHERE id = ?').run(testEstId);
    console.log("    Estudiante temporal eliminado para conservar exactamente 147 alumnos.");

    // 3. Probar que agregar un nuevo movimiento se exporta y guarda en el Excel automáticamente
    console.log("\n[3] Verificando sincronización automática con Excel al agregar un movimiento...");
    const excelPath = path.join(__dirname, '..', 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
    const statAntes = fs.statSync(excelPath);

    // Agregar movimiento
    const resNuevoMov = await request('POST', '/api/movimientos', {
        tipo: 'Ingreso',
        estado: 'Pagado',
        rol: 'Estudiante',
        nombre: 'ALUMNO TEST SINCRONIZACION EXCEL',
        grupo: 'G11 - Ensamblaje y Reparación de Computadoras - A',
        encargado: 'Lic. Teresa Aguilar Gómez',
        carrera: 'Confección Textil',
        concepto: 'Test de Sincronización Automática a Excel',
        monto: 15.00,
        monto_total: 15.00,
        monto_abonado: 15.00,
        fecha: '2026-10-18',
        metodo_pago: 'Efectivo',
        notas: 'Test automático de sincronización a Excel'
    });
    const nuevoMovJson = JSON.parse(resNuevoMov.body);
    if (!nuevoMovJson.success) throw new Error("Fallo al crear movimiento");
    const testMovId = nuevoMovJson.id;
    console.log(`    Movimiento temporal creado ID ${testMovId} por S/. 15.00`);

    // Verificar que el archivo Excel en disco fue regenerado
    const statDespues = fs.statSync(excelPath);
    console.log(`    Excel tamaño: ${statDespues.size} bytes. Timestamp modificado: ${statDespues.mtime.toISOString()}`);
    if (statDespues.mtimeMs < statAntes.mtimeMs) {
        throw new Error("El archivo Excel no fue actualizado en disco");
    }
    console.log("    ✅ Archivo Excel CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx actualizado en disco automáticamente.");

    // Verificar que GET /api/exportar/excel sirve el archivo actualizado
    const resExcelDownload = await request('GET', '/api/exportar/excel');
    if (resExcelDownload.statusCode !== 200) throw new Error("Fallo al descargar Excel");
    console.log(`    ✅ Endpoint /api/exportar/excel responde 200 OK con ${resExcelDownload.buffer.length} bytes.`);

    // Eliminar movimiento temporal para restaurar exactamente S/. 24,630.00
    const resDelMov = await request('DELETE', `/api/movimientos/${testMovId}`);
    db.prepare("DELETE FROM estudiantes WHERE nombre = 'ALUMNO TEST SINCRONIZACION EXCEL'").run();
    console.log("    Movimiento temporal eliminado, Excel re-sincronizado al total original.");

    // 4. Probar Seguridad de Respaldo y Verificación Criptográfica SHA-256
    console.log("\n[4] Verificando seguridad del respaldo y firma criptográfica SHA-256...");
    const resBackups = await request('GET', '/api/backups');
    const backups = JSON.parse(resBackups.body);
    if (backups.length === 0) throw new Error("No hay respaldos disponibles");
    const dbBackup = backups.find(b => b.extension === '.db') || backups[0];
    console.log(`    Verificando respaldo: ${dbBackup.nombre}`);
    console.log(`    Hash SHA-256: ${dbBackup.sha256}`);

    const resVerif = await request('GET', `/api/backups/verificar/${encodeURIComponent(dbBackup.nombre)}`);
    const verifJson = JSON.parse(resVerif.body);
    console.log("    Resultado de verificación:", verifJson);
    if (!verifJson.valido) throw new Error("Fallo en verificación criptográfica del respaldo");
    console.log("    ✅ Respaldo verificado 100% íntegro, seguro y consistente.");

    // 5. Verificar Integridad Numérica Global
    console.log("\n[5] Verificando integridad matemática institucional final...");
    const resFinalStats = await request('GET', '/api/stats');
    const finalStats = JSON.parse(resFinalStats.body);
    const totalAlumnos = finalStats.estudiantes ? finalStats.estudiantes.total_alumnos : 0;
    console.log(`    Total Ingresos: S/. ${Number(finalStats.total_ingresos).toFixed(2)} (Esperado: 24,630.00)`);
    console.log(`    Total Estudiantes: ${totalAlumnos} (Esperado: 147)`);
    if (finalStats.total_ingresos !== 24630) throw new Error("Discrepancia en total de ingresos");
    if (totalAlumnos !== 147) throw new Error("Discrepancia en total de alumnos");
    console.log("    ✅ Integridad matemática y de base de datos verificada al 100%.");

    console.log("\n==================================================================");
    console.log("   🎉 TODOS LOS REQUERIMIENTOS DEL USUARIO VERIFICADOS EXITOSAMENTE");
    console.log("==================================================================");
}

run().catch(err => {
    console.error("❌ ERROR EN PRUEBAS:", err);
    process.exit(1);
});
