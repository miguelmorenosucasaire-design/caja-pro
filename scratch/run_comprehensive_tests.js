const http = require('http');

console.log('================================================================');
console.log('   CETPRO MICAELA BASTIDAS - SUITE DE PRUEBAS AUTOMATIZADAS');
console.log('   (13 GRUPOS OFICIALES, 7 PROGRAMAS, MODIFICACIÓN DE NOMBRES/TURNOS)');
console.log('================================================================');

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: 5000,
            path: path,
            method: method,
            headers: body ? { 'Content-Type': 'application/json' } : {}
        }, res => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: buffer.toString('utf8'),
                    buffer: buffer
                });
            });
        });
        req.on('error', reject);
        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        process.stdout.write(`[*] Probando: ${name}... `);
        try {
            await fn();
            console.log('✅ OK');
            passed++;
        } catch (err) {
            console.log(`❌ FALLÓ: ${err.message}`);
            failed++;
        }
    }

    try {
        // Test 1: Conexión al servidor y carga de HTML
        await test('GET / (Carga de interfaz con 13 secciones y modales de edición)', async () => {
            const res = await request('GET', '/');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            if (!res.body.includes('CETPRO MICAELA BASTIDAS')) throw new Error('HTML no contiene nombre de institución');
            if (!res.body.includes('modal-editar-grupo')) throw new Error('No se encontró modal de edición de grupo/turno');
            if (!res.body.includes('modal-editar-docente')) throw new Error('No se encontró modal de edición de docente');
            if (!res.body.includes('contenedor-tabs-secciones-dinamicas')) throw new Error('No se encontró barra dinámica de pestañas');
        });

        // Test 2: Estadísticas del sistema
        await test('GET /api/stats (Ingresos S/. 24,630.00 y 147 alumnos)', async () => {
            const res = await request('GET', '/api/stats');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            const data = JSON.parse(res.body);
            if (data.total_ingresos !== 24630) throw new Error(`Ingresos esperados 24630, obtenido: ${data.total_ingresos}`);
            const totalEst = data.estudiantes?.total_alumnos || data.total_alumnos;
            if (totalEst !== 147) throw new Error(`Alumnos esperados 147, obtenido: ${totalEst}`);
            if (!data.meses_detalle || data.meses_detalle.length !== 12) throw new Error('Faltan los 12 meses de detalle');
        });

        // Test 3: Listado oficial de 13 Secciones / Grupos
        await test('GET /api/grupos (Exactamente 13 grupos: 3 Corte y Ensamblaje, 3 Peluquería)', async () => {
            const res = await request('GET', '/api/grupos');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            const data = JSON.parse(res.body);
            if (data.length !== 13) throw new Error(`Se esperaban 13 grupos, se recibieron ${data.length}`);
            
            const corte = data.filter(g => g.carrera.toLowerCase().includes('corte'));
            if (corte.length !== 3) throw new Error(`Se esperaban 3 grupos de Corte y Ensamblaje, hay ${corte.length}`);

            const peluqueria = data.filter(g => g.carrera.toLowerCase().includes('peluquería') || g.carrera.toLowerCase().includes('peluqueria'));
            if (peluqueria.length !== 3) throw new Error(`Se esperaban 3 grupos de Peluquería y Barbería, hay ${peluqueria.length}`);
        });

        // Test 4: Detalle de Plantilla de una Sección (G01 Corte y Ensamblaje)
        await test('GET /api/grupos/7/detalle (Plantilla oficial de sección con alumnos y pagos)', async () => {
            const res = await request('GET', '/api/grupos/7/detalle');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            const data = JSON.parse(res.body);
            if (!data.grupo || !data.estudiantes || !data.movimientos) throw new Error('Estructura de plantilla incompleta');
            if (data.estudiantes.length === 0) throw new Error('No hay estudiantes en la sección');
        });

        // Test 5: Estudiantes
        await test('GET /api/estudiantes (147 alumnos registrados)', async () => {
            const res = await request('GET', '/api/estudiantes');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            const data = JSON.parse(res.body);
            if (data.length !== 147) throw new Error(`Esperados 147 estudiantes, obtenido ${data.length}`);
        });

        // Test 6: Docentes
        await test('GET /api/docentes (Docentes oficiales de especialidad)', async () => {
            const res = await request('GET', '/api/docentes');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            const data = JSON.parse(res.body);
            if (data.length < 7) throw new Error(`Se esperaban al menos 7 docentes oficiales, hay ${data.length}`);
        });

        // Test 7: Modificar Sección y Turno mediante API
        await test('PUT /api/grupos/:id (Modificar nombre, turno, horario y aula de una sección)', async () => {
            // Obtenemos el grupo 7
            const resBefore = await request('GET', '/api/grupos/7/detalle');
            const gOrig = JSON.parse(resBefore.body).grupo;

            // Modificamos el turno y aula temporalmente
            const nuevoTurno = gOrig.turno === 'Mañana' ? 'Tarde' : 'Mañana';
            const resUpdate = await request('PUT', '/api/grupos/7', {
                nombre: gOrig.nombre,
                carrera: gOrig.carrera,
                encargado: gOrig.encargado,
                turno: nuevoTurno,
                horario: '08:00 AM - 01:00 PM',
                aula_taller: 'Taller Especializado A-1'
            });
            if (resUpdate.statusCode !== 200) throw new Error(`Status al actualizar ${resUpdate.statusCode}: ${resUpdate.body}`);
            const dataUp = JSON.parse(resUpdate.body);
            if (!dataUp.success) throw new Error('No devolvió success: true');

            // Verificamos que se actualizó
            const resAfter = await request('GET', '/api/grupos/7/detalle');
            const gMod = JSON.parse(resAfter.body).grupo;
            if (gMod.turno !== nuevoTurno) throw new Error(`El turno no cambió a ${nuevoTurno}`);

            // Restauramos el original
            await request('PUT', '/api/grupos/7', {
                nombre: gOrig.nombre,
                carrera: gOrig.carrera,
                encargado: gOrig.encargado,
                turno: gOrig.turno,
                horario: gOrig.horario,
                aula_taller: gOrig.aula_taller
            });
        });

        // Test 8: Modificar Docente mediante API
        await test('PUT /api/docentes/:id (Modificar nombre, especialidad y teléfono del docente)', async () => {
            const resDocs = await request('GET', '/api/docentes');
            const docs = JSON.parse(resDocs.body);
            const docTest = docs[0];

            const resUpdate = await request('PUT', `/api/docentes/${docTest.id}`, {
                nombre: docTest.nombre,
                carrera: docTest.carrera,
                especialidad: 'Especialista Técnico Titulado',
                telefono: '951234567',
                email: 'docente@cetpromicaelabastidas.edu.pe'
            });
            if (resUpdate.statusCode !== 200) throw new Error(`Status ${resUpdate.statusCode}`);
            const resVerify = await request('GET', `/api/docentes/${docTest.id}/detalle`);
            const dUpdated = JSON.parse(resVerify.body).docente;
            if (dUpdated.telefono !== '951234567') throw new Error('Teléfono no fue actualizado');
        });

        // Test 9: Descarga de Libro Excel oficial multi-hoja sincronizado
        await test('GET /api/exportar/excel (Descarga del archivo Excel multi-hoja en vivo)', async () => {
            const res = await request('GET', '/api/exportar/excel');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            if (res.buffer.length < 50000) throw new Error('Archivo Excel corrupto o demasiado pequeño');
            if (!res.headers['content-disposition'].includes('.xls')) throw new Error('Header no indica archivo Excel (.xlsx / .xlsm)');
        });

        // Test 10: Exportación de hoja Estudiantes a formato CSV Excel
        await test('GET /api/exportar/hoja?sheet=estudiantes (CSV UTF-8 BOM con columnas oficiales)', async () => {
            const res = await request('GET', '/api/exportar/hoja?sheet=estudiantes');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            if (!res.body.includes('CEPRO MICAELA BASTIDAS')) throw new Error('Falta encabezado institucional');
            if (!res.body.includes('DNI') || !res.body.includes('Total Pagado')) throw new Error('Faltan columnas de la hoja');
        });

        // Test 11: Exportación de hoja Grupos a formato CSV Excel
        await test('GET /api/exportar/hoja?sheet=grupos (CSV con las 13 secciones y turnos)', async () => {
            const res = await request('GET', '/api/exportar/hoja?sheet=grupos');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            if (!res.body.includes('Corte y Ensamblaje') || !res.body.includes('Peluquería')) throw new Error('Datos de secciones no encontrados en exportación');
        });

        // Test 12: Respaldos automáticos de Base de Datos
        await test('GET /api/backups (Consulta y respaldo verificado)', async () => {
            const res = await request('GET', '/api/backups');
            if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
            const data = JSON.parse(res.body);
            if (!Array.isArray(data) || data.length === 0) throw new Error('No se encontraron respaldos');
        });

        console.log('\n================================================================');
        console.log(` RESULTADO FINAL DE PRUEBAS: ${passed} PASADAS | ${failed} FALLIDAS`);
        console.log('================================================================');
        if (failed === 0) {
            console.log('🎉 TODAS LAS 12 FUNCIONALIDADES ESTÁN OPERATIVAS Y VERIFICADAS AL 100%');
        }

    } catch (e) {
        console.error('Error fatal durante la ejecución de pruebas:', e);
    }
}

runTests();
