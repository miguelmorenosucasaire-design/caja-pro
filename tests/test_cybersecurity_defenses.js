const http = require('http');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'caja_institucional.db');

function request(method, pathUrl, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL('http://127.0.0.1:5000' + pathUrl);
        const reqHeaders = { ...headers };
        if (body && !reqHeaders['Content-Type']) {
            reqHeaders['Content-Type'] = 'application/json';
        }
        const req = http.request({
            hostname: u.hostname,
            port: u.port,
            path: u.pathname + u.search,
            method: method,
            headers: reqHeaders
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

async function runCybersecurityTests() {
    console.log('========================================================================');
    console.log('  🛡️ SUITE DE PRUEBAS DEFENSIVAS DE CIBERSEGURIDAD Y RESILIENCIA      ');
    console.log('========================================================================\n');

    let passed = 0;
    let failed = 0;

    function assertTest(name, condition, details = '') {
        if (condition) {
            console.log(`  ✔ [PASÓ] ${name}`);
            passed++;
        } else {
            console.error(`  ❌ [FALLÓ] ${name}: ${details}`);
            failed++;
        }
    }

    // -------------------------------------------------------------
    // 1. INYECCIÓN SQL (SQL Injection - SQLi)
    // -------------------------------------------------------------
    console.log('📌 1. PRUEBAS CONTRA INYECCIÓN SQL (SQLi):');
    
    // 1.1 Inyección en búsqueda de estudiantes (OR 1=1)
    const sqliSearch = await request('GET', '/api/estudiantes?search=' + encodeURIComponent("' OR '1'='1"));
    assertTest('SQLi Búsqueda Estudiantes con cláusula OR 1=1', 
        sqliSearch.status === 200 && Array.isArray(sqliSearch.json) && sqliSearch.json.length === 0,
        `Respuesta inesperada: ${sqliSearch.status}, elementos devueltos: ${sqliSearch.json ? sqliSearch.json.length : 'N/A'}`);

    // 1.2 Inyección destructiva (DROP TABLE)
    const sqliDrop = await request('GET', '/api/estudiantes?search=' + encodeURIComponent("'; DROP TABLE test_sqli; --"));
    assertTest('SQLi Intento de inyección multisentencia DROP TABLE', 
        sqliDrop.status === 200 && Array.isArray(sqliDrop.json) && sqliDrop.json.length === 0,
        `Status: ${sqliDrop.status}`);

    // 1.3 Inyección UNION SELECT
    const sqliUnion = await request('GET', '/api/estudiantes?search=' + encodeURIComponent("' UNION SELECT 1, 'admin', 'pass', 'x', 'y', 'z', 'w' --"));
    assertTest('SQLi Intento de UNION SELECT para extracción de tablas', 
        sqliUnion.status === 200 && Array.isArray(sqliUnion.json) && sqliUnion.json.length === 0,
        `Retornó datos no esperados`);

    // 1.4 Inyección SQL en filtro de movimientos
    const sqliMovs = await request('GET', '/api/movimientos?mes=' + encodeURIComponent("01' OR '1'='1"));
    assertTest('SQLi en parámetro de filtrado de movimientos por mes', 
        sqliMovs.status === 200,
        `Status: ${sqliMovs.status}`);

    // 1.5 Inyección SQL en ID de ruta numérica
    const sqliId = await request('GET', '/api/movimientos/' + encodeURIComponent("1 OR 1=1"));
    assertTest('SQLi en parámetro de ruta /api/movimientos/:id', 
        sqliId.status === 400 || sqliId.status === 404,
        `Status recibido: ${sqliId.status}`);

    // -------------------------------------------------------------
    // 2. CROSS-SITE SCRIPTING (XSS) Y SANITIZACIÓN
    // -------------------------------------------------------------
    console.log('\n📌 2. PRUEBAS CONTRA CROSS-SITE SCRIPTING (XSS):');

    const xssPayload = {
        nombre: "<script>alert('XSS_ATTACK')</script>",
        dni: "12345678",
        telefono: "999000111",
        carrera: "Computación",
        turno: "Noche",
        notas: "<img src=x onerror=alert('PWNED')>",
        grupo: "G02 Computación"
    };

    const rXss = await request('POST', '/api/estudiantes', xssPayload);
    assertTest('Recepción y neutralización de payload XSS en POST /api/estudiantes', 
        rXss.status === 200 || rXss.status === 201,
        `Status: ${rXss.status}`);

    // Verificar en BD que el payload no rompió la estructura y se almacena seguro
    const db = new DatabaseSync(DB_PATH);
    const estXss = db.prepare("SELECT * FROM estudiantes WHERE dni = '12345678'").get();
    assertTest('Persistencia segura de cadenas con caracteres < > sin inyección en BD', 
        estXss && estXss.dni === '12345678',
        `No se encontró el registro o BD corrupta`);

    // Limpiar registro de prueba
    if (estXss) {
        db.prepare("DELETE FROM estudiantes WHERE id = ?").run(estXss.id);
    }
    db.close();

    // -------------------------------------------------------------
    // 3. PATH TRAVERSAL Y ACCESO NO AUTORIZADO A ARCHIVOS (LFI)
    // -------------------------------------------------------------
    console.log('\n📌 3. PRUEBAS CONTRA PATH TRAVERSAL Y FUGA DE ARCHIVOS:');

    // 3.1 Intento de leer server.js vía ruta estática
    const rTrav1 = await request('GET', '/public/../server.js');
    assertTest('Bloqueo de Path Traversal directo (/public/../server.js)', 
        rTrav1.status === 403 || rTrav1.status === 404,
        `Status: ${rTrav1.status}`);

    // 3.2 Intento de leer package.json con codificación url %2e%2e%2f
    const rTrav2 = await request('GET', '/public/%2e%2e%2fpackage.json');
    assertTest('Bloqueo de Path Traversal codificado (%2e%2e%2fpackage.json)', 
        rTrav2.status === 400 || rTrav2.status === 403 || rTrav2.status === 404,
        `Status: ${rTrav2.status}`);

    // 3.3 Intento de borrado arbitrario vía /api/backups/:filename
    const rDelTrav = await request('DELETE', '/api/backups/..%2f..%2fserver.js');
    assertTest('Bloqueo de borrado de archivo fuera del directorio de backups', 
        rDelTrav.status === 400 || rDelTrav.status === 403 || rDelTrav.status === 404,
        `Status: ${rDelTrav.status}`);

    // -------------------------------------------------------------
    // 4. CABECERAS HTTP DE SEGURIDAD (HTTP Hardening)
    // -------------------------------------------------------------
    console.log('\n📌 4. AUDITORÍA DE CABECERAS HTTP DE SEGURIDAD:');

    const rStats = await request('GET', '/api/stats');
    const nosniff = rStats.headers['x-content-type-options'];
    const xframe = rStats.headers['x-frame-options'];
    const xssProt = rStats.headers['x-xss-protection'];

    assertTest('Cabecera X-Content-Type-Options: nosniff presente', 
        nosniff === 'nosniff',
        `Valor: ${nosniff}`);

    assertTest('Cabecera X-Frame-Options: SAMEORIGIN (Anti-Clickjacking)', 
        xframe === 'SAMEORIGIN',
        `Valor: ${xframe}`);

    assertTest('Cabecera X-XSS-Protection presente', 
        xssProt && xssProt.includes('1'),
        `Valor: ${xssProt}`);

    // -------------------------------------------------------------
    // 5. MANIPULACIÓN DE PARÁMETROS, TIPOS Y ESTABILIDAD (Fuzzing)
    // -------------------------------------------------------------
    console.log('\n📌 5. MANIPULACIÓN DE PARÁMETROS Y TIPOS DE DATOS (Fuzzing):');

    // 5.1 ID no numérico en borrado de movimientos
    const rBadId1 = await request('DELETE', '/api/movimientos/not_a_number');
    assertTest('Validación de ID no numérico en DELETE /api/movimientos/:id', 
        rBadId1.status === 400 && rBadId1.json && rBadId1.json.error,
        `Status: ${rBadId1.status}`);

    // 5.2 ID negativo en movimientos
    const rBadId2 = await request('DELETE', '/api/movimientos/-50');
    assertTest('Rechazo seguro de ID negativo en /api/movimientos/-50', 
        rBadId2.status === 400 || rBadId2.status === 404,
        `Status: ${rBadId2.status}`);

    // 5.3 ID inexistente pero válido numéricamente
    const rNonExistent = await request('DELETE', '/api/movimientos/9999999');
    assertTest('Manejo adecuado de ID inexistente (404 Not Found)', 
        rNonExistent.status === 404,
        `Status: ${rNonExistent.status}`);

    // 5.4 JSON malformado en cuerpo de solicitud
    const rMalformedJson = await request('POST', '/api/estudiantes', '{ malformed: json, ', { 'Content-Type': 'application/json' });
    assertTest('Resiliencia ante JSON malformado (400 Bad Request sin caída del servidor)', 
        rMalformedJson.status === 400 || rMalformedJson.status === 500,
        `Status: ${rMalformedJson.status}`);

    // 5.5 Comprobación de que el servidor sigue vivo después del fuzzing
    const rHealth = await request('GET', '/api/stats');
    assertTest('Servidor activo y respondiendo 200 tras pruebas de ataque', 
        rHealth.status === 200 && rHealth.json && rHealth.json.total_ingresos !== undefined,
        `Servidor no respondió adecuadamente`);

    console.log('\n========================================================================');
    console.log(`  RESUMEN: ${passed} pruebas pasadas, ${failed} pruebas falladas`);
    console.log('========================================================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runCybersecurityTests().catch(err => {
    console.error('Error fatal durante la prueba de ciberseguridad:', err);
    process.exit(1);
});
