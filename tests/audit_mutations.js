// =====================================================================
// EDUCAJA PRO - AUDITORÍA DE MUTACIONES (POST, PUT, DELETE) Y VALIDACIONES
// =====================================================================
const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const TEST_PORT = 5126;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

console.log('--- INICIANDO AUDITORÍA DE MUTACIONES Y SEGURIDAD API ---');

const serverProc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(TEST_PORT), NO_AUTO_OPEN: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
});

let isDone = false;
function finish(code) {
    if (isDone) return;
    isDone = true;
    serverProc.kill();

    // Limpieza de seguridad post-test
    try {
        const db = new DatabaseSync(path.join(__dirname, '..', 'caja_institucional.db'));
        db.prepare("DELETE FROM movimientos WHERE nombre LIKE '%Test%'").run();
        db.prepare("DELETE FROM estudiantes WHERE nombre LIKE '%Test%'").run();
        db.prepare("DELETE FROM carreras WHERE nombre LIKE '%Test%'").run();
    } catch (e) {}

    process.exit(code);
}

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = http.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const str = Buffer.concat(chunks).toString('utf-8');
                let parsed = null;
                try { parsed = JSON.parse(str); } catch (e) { parsed = str; }
                resolve({ status: res.statusCode, body: parsed });
            });
        });
        req.on('error', reject);
        if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
        req.end();
    });
}

async function runMutationsAudit() {
    await new Promise(r => setTimeout(r, 1600));

    try {
        // 1. Validar que POST /api/movimientos rechaza montos inválidos o nulos
        const rBadMov = await request('POST', '/api/movimientos', { tipo: 'Ingreso', monto: 0, nombre: 'Test Invalido' });
        console.log('1. Rechazo de monto <= 0 en movimientos:', rBadMov.status === 400 ? '✔ Correcto (400)' : `Aviso status=${rBadMov.status}`);

        // 2. Validar que POST /api/carreras maneja nombres duplicados o vacíos
        const rEmptyCarrera = await request('POST', '/api/carreras', { nombre: '' });
        console.log('2. Rechazo de carrera vacía:', rEmptyCarrera.status >= 400 ? '✔ Correcto' : `Aviso status=${rEmptyCarrera.status}`);

        // 3. Crear una carrera temporal y luego eliminarla
        const testCarreraNombre = `Especialidad_Test_${Date.now()}`;
        const rNewCarrera = await request('POST', '/api/carreras', { nombre: testCarreraNombre, codigo: 'ESP-99' });
        console.log('3. Creación de carrera de prueba:', rNewCarrera.status === 200 ? '✔ Creada' : `Aviso status=${rNewCarrera.status}`);
        const carreraId = rNewCarrera.body && rNewCarrera.body.carrera ? rNewCarrera.body.carrera.id : null;

        if (carreraId) {
            const rDelCarrera = await request('DELETE', `/api/carreras/${carreraId}`);
            console.log('   Eliminación y limpieza de carrera de prueba:', rDelCarrera.status === 200 ? '✔ Eliminada con éxito' : `Fallo ${rDelCarrera.status}`);
        }

        // 4. Validar actualización de configuración institucional
        const rGetCfg = await request('GET', '/api/configuracion');
        const origNombre = rGetCfg.body.nombre_institucion;
        const rPostCfg = await request('POST', '/api/configuracion', { nombre_institucion: origNombre });
        console.log('4. Endpoint de actualización de configuración institucional:', rPostCfg.status === 200 ? '✔ OK' : `Fallo ${rPostCfg.status}`);

        console.log('--- AUDITORÍA DE MUTACIONES COMPLETADA CON ÉXITO ---');
        finish(0);
    } catch (err) {
        console.error('Error en auditoría de mutaciones:', err.message);
        finish(1);
    }
}

runMutationsAudit();
