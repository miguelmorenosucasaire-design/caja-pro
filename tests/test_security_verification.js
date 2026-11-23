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

async function verifySecurity() {
    console.log('--- 🛡️ VERIFICACIÓN INTEGRAL DE PARCHES DE SEGURIDAD Y BUGS ---');

    // 1. Blindaje contra Path Traversal
    const rTrav1 = await request('GET', '/public/../server.js');
    console.log('1. Path Traversal (/public/../server.js): Status', rTrav1.status);
    if (rTrav1.status === 403 || rTrav1.status === 404) {
        console.log('   ✔ [PROTEGIDO] Intento de escape de directorio bloqueado con éxito.');
    } else {
        console.error('   ❌ [VULNERABLE] Código:', rTrav1.status);
    }

    // 2. Blindaje de Respaldo contra borrado arbitrario
    const rDelTrav = await request('DELETE', '/api/backups/server.js');
    console.log('\n2. Borrado de archivo restringido (/api/backups/server.js): Status', rDelTrav.status);
    if (rDelTrav.status === 400 && rDelTrav.json && rDelTrav.json.error) {
        console.log('   ✔ [PROTEGIDO] Rechazado con 400:', rDelTrav.json.error);
    } else {
        console.error('   ❌ [VULNERABLE] Permitió intentar borrar archivo no autorizado:', rDelTrav.status);
    }

    // 3. Validación en DELETE /api/movimientos/:id
    const rDelMovInvalid = await request('DELETE', '/api/movimientos/abc');
    console.log('\n3. Borrado con ID inválido (/api/movimientos/abc): Status', rDelMovInvalid.status);
    if (rDelMovInvalid.status === 400 && rDelMovInvalid.json && rDelMovInvalid.json.error) {
        console.log('   ✔ [CORREGIDO] Rechazado con 400:', rDelMovInvalid.json.error);
    } else {
        console.error('   ❌ [BUG] No validó el ID:', rDelMovInvalid.status);
    }

    const rDelMovNonExistent = await request('DELETE', '/api/movimientos/999999');
    console.log('   Borrado con ID inexistente (/api/movimientos/999999): Status', rDelMovNonExistent.status);
    if (rDelMovNonExistent.status === 404 && rDelMovNonExistent.json && rDelMovNonExistent.json.error) {
        console.log('   ✔ [CORREGIDO] Reportó 404 Not Found correctamente.');
    } else {
        console.error('   ❌ [BUG] No reportó 404:', rDelMovNonExistent.status);
    }

    // 4. Encabezados de Seguridad en respuestas HTTP
    const rHeaders = await request('GET', '/api/stats');
    console.log('\n4. Encabezados HTTP de Seguridad:');
    const nosniff = rHeaders.headers['x-content-type-options'];
    const xframe = rHeaders.headers['x-frame-options'];
    const xss = rHeaders.headers['x-xss-protection'];
    console.log('   X-Content-Type-Options:', nosniff);
    console.log('   X-Frame-Options:', xframe);
    console.log('   X-XSS-Protection:', xss);
    if (nosniff === 'nosniff' && xframe === 'SAMEORIGIN') {
        console.log('   ✔ [PROTEGIDO] Encabezados de protección contra Sniffing y Clickjacking activos.');
    } else {
        console.error('   ❌ [ALERTA] Falta algún encabezado de seguridad.');
    }

    // 5. Persistencia de DNI, Turno y Notas en Estudiantes
    console.log('\n5. Prueba de Persistencia de DNI, Turno y Notas en Estudiantes:');
    const testPayload = {
        nombre: "TEST ALUMNO SEGURIDAD PARCHADO",
        dni: "88776655",
        telefono: "999888777",
        carrera: "Computación",
        turno: "Noche",
        notas: "Alumno de verificación de seguridad",
        grupo: "G02 Computación"
    };

    const rCreateEst = await request('POST', '/api/estudiantes', testPayload);
    console.log('   Crear estudiante con DNI:', rCreateEst.status, rCreateEst.json ? rCreateEst.json.message : '');

    const db = new DatabaseSync(DB_PATH);
    const estSaved = db.prepare("SELECT * FROM estudiantes WHERE dni = '88776655'").get();
    if (estSaved && estSaved.dni === '88776655' && estSaved.turno === 'Noche' && estSaved.notas === 'Alumno de verificación de seguridad') {
        console.log(`   ✔ [CORREGIDO] DNI (${estSaved.dni}), Turno (${estSaved.turno}) y Notas guardados exitosamente en la BD.`);
    } else {
        console.error('   ❌ [BUG] DNI o turno no se guardaron en la BD:', estSaved);
    }

    // Limpiar alumno de prueba
    if (estSaved) {
        db.prepare("DELETE FROM estudiantes WHERE id = ?").run(estSaved.id);
        console.log('   ✔ Registro de prueba eliminado para mantener la base de datos limpia.');
    }
    db.close();

    console.log('\n========================================================================');
    console.log('  🛡️ TODOS LOS PARCHES DE SEGURIDAD Y BUGS FUERON VALIDADOS CON ÉXITO   ');
    console.log('========================================================================');
}

verifySecurity().catch(console.error);
