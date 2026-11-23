const http = require('http');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'caja_institucional.db');

function request(method, pathUrl, body = null) {
    return new Promise((resolve, reject) => {
        const u = new URL('http://127.0.0.1:5000' + pathUrl);
        const req = http.request({
            hostname: u.hostname,
            port: u.port,
            path: u.pathname + u.search,
            method: method,
            headers: body ? { 'Content-Type': 'application/json' } : {}
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(data); } catch (e) {}
                resolve({ status: res.statusCode, headers: res.headers, body: data, json });
            });
        });
        req.on('error', reject);
        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
    });
}

async function runUserWorkflowTests() {
    console.log('========================================================================');
    console.log('  👤 SUITE DE PRUEBAS DE USUARIO Y FLUJOS OPERATIVOS END-TO-END         ');
    console.log('========================================================================\n');

    let passed = 0;
    let failed = 0;
    let testStudentId = null;
    let testMovimientoId = null;

    function assertTest(name, condition, details = '') {
        if (condition) {
            console.log(`  ✔ [PASÓ] ${name}`);
            passed++;
        } else {
            console.error(`  ❌ [FALLÓ] ${name}: ${details}`);
            failed++;
        }
    }

    try {
        // -------------------------------------------------------------
        // Flujo 1: Acceso al Dashboard y Estadísticas
        // -------------------------------------------------------------
        console.log('📌 FLUJO 1: Consulta del Dashboard y Métricas de Caja:');
        const rStats = await request('GET', '/api/stats');
        assertTest('Carga exitosa de métricas generales (GET /api/stats)', 
            rStats.status === 200 && rStats.json && rStats.json.total_ingresos !== undefined,
            `Status: ${rStats.status}`);

        // -------------------------------------------------------------
        // Flujo 2: Consulta de Catálogos de Grupos y Docentes
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 2: Visualización de Catálogos (Grupos y Docentes):');
        const rGrupos = await request('GET', '/api/grupos');
        assertTest('Carga de 13 grupos formativos oficiales', 
            rGrupos.status === 200 && Array.isArray(rGrupos.json) && rGrupos.json.length >= 13,
            `Grupos encontrados: ${rGrupos.json ? rGrupos.json.length : 0}`);

        const rDocentes = await request('GET', '/api/docentes');
        assertTest('Carga de nómina de docentes', 
            rDocentes.status === 200 && Array.isArray(rDocentes.json) && rDocentes.json.length > 0,
            `Docentes encontrados: ${rDocentes.json ? rDocentes.json.length : 0}`);

        // -------------------------------------------------------------
        // Flujo 3: Búsqueda y Filtrado de Estudiantes
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 3: Búsqueda de Alumnos por Nombre y DNI:');
        const rSearch = await request('GET', '/api/estudiantes?search=Julio');
        assertTest('Búsqueda por texto con resultados válidos', 
            rSearch.status === 200 && Array.isArray(rSearch.json) && rSearch.json.length > 0,
            `Resultados: ${rSearch.json ? rSearch.json.length : 0}`);

        // -------------------------------------------------------------
        // Flujo 4: Registro de Nuevo Estudiante con Emisión de Recibo
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 4: Registro de Alumno y Emisión de Recibo en Vivo:');
        const nuevoPayload = {
            dni: "77889900",
            nombre: "USUARIO TEST FLUJO AUTOMATICO",
            telefono: "987654321",
            carrera: "Computación",
            turno: "Noche",
            fecha: "2026-11-15",
            monto: 150.00,
            concepto: "Módulo I",
            notas: "Inscripción regular con recibo oficial"
        };

        const rNuevoEst = await request('POST', '/api/estudiantes/nuevo-con-recibo', nuevoPayload);
        assertTest('Emisión de nuevo recibo y registro simultáneo de estudiante', 
            rNuevoEst.status === 200 && rNuevoEst.json && rNuevoEst.json.success,
            `Mensaje: ${rNuevoEst.json ? rNuevoEst.json.error || rNuevoEst.json.message : 'N/A'}`);

        if (rNuevoEst.json && rNuevoEst.json.movimiento_id) {
            testMovimientoId = rNuevoEst.json.movimiento_id;
            testStudentId = rNuevoEst.json.estudiante_id;
        }

        // -------------------------------------------------------------
        // Flujo 5: Verificación del Comprobante Generado
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 5: Carga y Verificación de Datos en Comprobante Oficial:');
        const db = new DatabaseSync(DB_PATH);
        const movCreado = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(testMovimientoId);
        assertTest('Comprobante generado con correlativo oficial de 7 dígitos', 
            movCreado && movCreado.comprobante && movCreado.comprobante.length >= 7,
            `Comprobante: ${movCreado ? movCreado.comprobante : 'N/A'}`);

        assertTest('Monto asignado correctamente a Aporte por Mantenimiento (S/ 150.00)', 
            movCreado && Number(movCreado.monto) === 150,
            `Monto: ${movCreado ? movCreado.monto : 'N/A'}`);
        db.close();

        // -------------------------------------------------------------
        // Flujo 6: Actualización de Fecha de Emisión del Comprobante
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 6: Cambio y Sincronización de Fecha de Emisión:');
        const rFecha = await request('PUT', `/api/movimientos/${testMovimientoId}/fecha`, { fecha: "2026-11-20" });
        assertTest('Actualización de fecha de emisión (PUT /api/movimientos/:id/fecha)', 
            rFecha.status === 200 && rFecha.json && rFecha.json.success,
            `Respuesta: ${JSON.stringify(rFecha.json)}`);

        // -------------------------------------------------------------
        // Flujo 7: Reasignación de Grupo del Estudiante
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 7: Reasignación de Grupo del Estudiante:');
        const rEditEst = await request('POST', `/api/estudiantes/${testStudentId}/editar`, { grupo: "G02 Computación" });
        assertTest('Reasignación exitosa de grupo para el estudiante', 
            rEditEst.status === 200 && rEditEst.json && rEditEst.json.success,
            `Respuesta: ${JSON.stringify(rEditEst.json)}`);

        // -------------------------------------------------------------
        // Flujo 8: Creación y Consulta de Respaldos
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 8: Gestión de Respaldos Institucionales:');
        const rGenBackup = await request('POST', '/api/backups/crear', { motivo: 'Prueba_Usuario_Automatica' });
        assertTest('Generación de paquete de respaldo ZIP (BD + Excel)', 
            rGenBackup.status === 200 && rGenBackup.json && rGenBackup.json.success,
            `Respuesta: ${JSON.stringify(rGenBackup.json)}`);

        const rListBackups = await request('GET', '/api/backups');
        assertTest('Consulta de lista de copias de seguridad activas', 
            rListBackups.status === 200 && Array.isArray(rListBackups.json) && rListBackups.json.length > 0,
            `Cantidad de respaldos: ${rListBackups.json ? rListBackups.json.length : 0}`);

        // -------------------------------------------------------------
        // Flujo 9: Descarga de Versiones del Respaldo (DB y Excel)
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 9: Descarga de Archivos de Auditoría (DB y Excel):');
        const rDownDb = await request('GET', '/api/backups/descargar-version/db');
        assertTest('Descarga de base de datos SQLite (.db)', 
            rDownDb.status === 200 && rDownDb.body.length > 1000,
            `Bytes descargados: ${rDownDb.body.length}`);

        const rDownXlsx = await request('GET', '/api/backups/descargar-version/excel');
        assertTest('Descarga de libro contable Excel (.xlsx)', 
            rDownXlsx.status === 200 && rDownXlsx.body.length > 1000,
            `Bytes descargados: ${rDownXlsx.body.length}`);

        // -------------------------------------------------------------
        // Flujo 10: Limpieza Segura de Datos de Prueba
        // -------------------------------------------------------------
        console.log('\n📌 FLUJO 10: Limpieza de Registro de Prueba:');
        if (testMovimientoId) {
            const rDelMov = await request('DELETE', `/api/movimientos/${testMovimientoId}`);
            assertTest('Eliminación controlada del movimiento de prueba', 
                rDelMov.status === 200 && rDelMov.json && rDelMov.json.success,
                `Respuesta: ${JSON.stringify(rDelMov.json)}`);
        }

        if (testStudentId) {
            const rDelEst = await request('DELETE', `/api/estudiantes/${testStudentId}`);
            assertTest('Depuración del estudiante temporal de la BD y sincronización de Excel', 
                rDelEst.status === 200 && rDelEst.json && rDelEst.json.success,
                `Respuesta: ${JSON.stringify(rDelEst.json)}`);
        }

    } catch (e) {
        console.error('Error durante la ejecución del flujo de usuario:', e);
        failed++;
    }

    console.log('\n========================================================================');
    console.log(`  RESUMEN: ${passed} pruebas pasadas, ${failed} pruebas falladas`);
    console.log('========================================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runUserWorkflowTests().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
