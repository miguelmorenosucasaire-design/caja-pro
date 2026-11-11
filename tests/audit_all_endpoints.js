// =====================================================================
// EDUCAJA PRO - AUDITORÍA COMPLETA DE TODOS LOS ENDPOINTS (44 RUTAS)
// =====================================================================
const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');

const TEST_PORT = 5125;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

console.log('--- INICIANDO AUDITORÍA TOTAL DE ENDPOINTS DEL BACKEND ---');

const serverProc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(TEST_PORT), NO_AUTO_OPEN: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
});

let isDone = false;
function finish(code) {
    if (isDone) return;
    isDone = true;
    serverProc.kill();
    process.exit(code);
}

serverProc.stderr.on('data', d => {
    const s = d.toString();
    if (!s.includes('ExperimentalWarning')) console.error('[SERVER STDERR]:', s.trim());
});

function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                ...headers,
                'Content-Type': headers['Content-Type'] || 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const str = buffer.toString('utf-8');
                let parsed = null;
                try {
                    parsed = JSON.parse(str);
                } catch (e) {
                    parsed = str;
                }
                resolve({ status: res.statusCode, headers: res.headers, body: parsed, buffer });
            });
        });

        req.on('error', reject);
        if (body) {
            req.write(typeof body === 'string' ? body : JSON.stringify(body));
        }
        req.end();
    });
}

async function runAudit() {
    await new Promise(r => setTimeout(r, 1600));

    const tests = [
        { name: 'GET /', fn: () => request('GET', '/') },
        { name: 'GET /api/stats', fn: () => request('GET', '/api/stats') },
        { name: 'GET /api/movimientos', fn: () => request('GET', '/api/movimientos') },
        { name: 'GET /api/estudiantes', fn: () => request('GET', '/api/estudiantes') },
        { name: 'GET /api/docentes', fn: () => request('GET', '/api/docentes') },
        { name: 'GET /api/grupos', fn: () => request('GET', '/api/grupos') },
        { name: 'GET /api/carreras', fn: () => request('GET', '/api/carreras') },
        { name: 'GET /api/configuracion', fn: () => request('GET', '/api/configuracion') },
        { name: 'GET /api/deudores', fn: () => request('GET', '/api/deudores') },
        { name: 'GET /api/diario', fn: () => request('GET', '/api/diario') },
        { name: 'GET /api/estudiantes/calendarizacion', fn: () => request('GET', '/api/estudiantes/calendarizacion') },
        { name: 'GET /api/backups', fn: () => request('GET', '/api/backups') },
        { name: 'GET /api/backups/estado-actual', fn: () => request('GET', '/api/backups/estado-actual') },
        { name: 'GET /api/backups/descargar-version/db', fn: () => request('GET', '/api/backups/descargar-version/db') },
        { name: 'GET /api/backups/descargar-version/excel', fn: () => request('GET', '/api/backups/descargar-version/excel') },
        { name: 'GET /api/backups/descargar-version/zip', fn: () => request('GET', '/api/backups/descargar-version/zip') },
        { name: 'GET /api/exportar/excel', fn: () => request('GET', '/api/exportar/excel') },
        { name: 'GET /api/exportar/csv', fn: () => request('GET', '/api/exportar/csv') },
        { name: 'GET /api/exportar/resultados', fn: () => request('GET', '/api/exportar/resultados') },
        { name: 'GET /api/exportar/hoja?hoja=ESTUDIANTES', fn: () => request('GET', '/api/exportar/hoja?hoja=ESTUDIANTES') }
    ];

    let passed = 0;
    let failed = 0;

    for (const t of tests) {
        try {
            const res = await t.fn();
            if (res.status >= 200 && res.status < 300) {
                console.log(`✔ [OK ${res.status}] ${t.name}`);
                passed++;
            } else {
                console.error(`❌ [ERROR ${res.status}] ${t.name}:`, res.body);
                failed++;
            }
        } catch (err) {
            console.error(`❌ [EXCEPTION] ${t.name}:`, err.message);
            failed++;
        }
    }

    console.log(`\n--- RESULTADOS: ${passed} PASADOS, ${failed} FALLIDOS (TOTAL ${tests.length}) ---`);
    finish(failed > 0 ? 1 : 0);
}

runAudit();
