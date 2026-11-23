// =====================================================================
// EDUCAJA PRO - Test de Endpoints HTTP y API en Vivo
// =====================================================================
const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');

const TEST_PORT = 5123;
process.env.PORT = String(TEST_PORT);
process.env.NO_AUTO_OPEN = '1';

console.log('--- INICIANDO TEST INTEGRAL DE API EN VIVO ---');

const serverProcess = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(TEST_PORT), NO_AUTO_OPEN: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
});

let isExiting = false;
function cleanupAndExit(code) {
    if (isExiting) return;
    isExiting = true;
    serverProcess.kill();
    process.exit(code);
}

serverProcess.on('error', (err) => {
    console.error('[ERROR PROCESO SERVIDOR]:', err);
    cleanupAndExit(1);
});

serverProcess.stderr.on('data', (d) => {
    const s = d.toString();
    if (!s.includes('ExperimentalWarning')) {
        console.error('[STDERR SERVIDOR]:', s.trim());
    }
});

function httpGet(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://127.0.0.1:${TEST_PORT}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    parsed = data;
                }
                resolve({ status: res.statusCode, headers: res.headers, data: parsed });
            });
        });
        req.on('error', reject);
    });
}

async function runTests() {
    // Esperar 1.5s a que el servidor inicialice
    await new Promise(r => setTimeout(r, 1500));

    try {
        // 1. Test HTML Principal
        const rHtml = await httpGet('/');
        if (rHtml.status === 200 && typeof rHtml.data === 'string' && (rHtml.data.includes('CETPRO') || rHtml.data.includes('EduCaja'))) {
            console.log('✔ GET / (HTML Principal): OK 200');
        } else {
            throw new Error(`Fallo en GET / status=${rHtml.status}`);
        }

        // 2. Test /api/stats
        const rStats = await httpGet('/api/stats');
        if (rStats.status === 200 && rStats.data) {
            console.log(`✔ GET /api/stats: OK 200 (Total ingresos: S/. ${rStats.data.total_ingresos || rStats.data.ingresos || 0})`);
        } else {
            throw new Error(`Fallo en GET /api/stats status=${rStats.status}`);
        }

        // 3. Test /api/estudiantes
        const rEst = await httpGet('/api/estudiantes');
        if (rEst.status === 200 && Array.isArray(rEst.data)) {
            console.log(`✔ GET /api/estudiantes: OK 200 (${rEst.data.length} estudiantes devueltos)`);
        } else {
            throw new Error(`Fallo en GET /api/estudiantes`);
        }

        // 4. Test /api/docentes
        const rDoc = await httpGet('/api/docentes');
        if (rDoc.status === 200 && Array.isArray(rDoc.data)) {
            console.log(`✔ GET /api/docentes: OK 200 (${rDoc.data.length} docentes devueltos)`);
        } else {
            throw new Error(`Fallo en GET /api/docentes`);
        }

        // 5. Test /api/grupos
        const rGrp = await httpGet('/api/grupos');
        if (rGrp.status === 200 && Array.isArray(rGrp.data)) {
            console.log(`✔ GET /api/grupos: OK 200 (${rGrp.data.length} grupos devueltos)`);
        } else {
            throw new Error(`Fallo en GET /api/grupos`);
        }

        // 6. Test /api/carreras
        const rCar = await httpGet('/api/carreras');
        if (rCar.status === 200 && Array.isArray(rCar.data)) {
            console.log(`✔ GET /api/carreras: OK 200 (${rCar.data.length} carreras devueltas)`);
        } else {
            throw new Error(`Fallo en GET /api/carreras`);
        }

        // 7. Test /api/configuracion
        const rCfg = await httpGet('/api/configuracion');
        if (rCfg.status === 200 && rCfg.data && rCfg.data.nombre_institucion) {
            console.log(`✔ GET /api/configuracion: OK 200 (${rCfg.data.nombre_institucion})`);
        } else {
            throw new Error(`Fallo en GET /api/configuracion`);
        }

        // 8. Test /api/backups/estado-actual
        const rBkp = await httpGet('/api/backups/estado-actual');
        if (rBkp.status === 200 && rBkp.data) {
            console.log(`✔ GET /api/backups/estado-actual: OK 200 (SHA-256 DB: ${rBkp.data.db.sha256 ? rBkp.data.db.sha256.substring(0, 12) + '...' : 'OK'})`);
        } else {
            throw new Error(`Fallo en GET /api/backups/estado-actual`);
        }

        // 9. Test /public/html2pdf.bundle.min.js (Librería de exportación de PDF para impresión)
        const rPdfLib = await httpGet('/public/html2pdf.bundle.min.js');
        if (rPdfLib.status === 200 && rPdfLib.data && typeof rPdfLib.data === 'string' && rPdfLib.data.length > 500000) {
            console.log(`✔ GET /public/html2pdf.bundle.min.js: OK 200 (${(rPdfLib.data.length / 1024).toFixed(1)} KB servidos localmente)`);
        } else {
            throw new Error(`Fallo al servir biblioteca html2pdf local`);
        }

        console.log('--- TODOS LOS TESTS DE INTEGRACIÓN DE API PASARON CON ÉXITO (9/9) ---');
        cleanupAndExit(0);
    } catch (err) {
        console.error('[ERROR TEST INTEGRAL]:', err.message);
        cleanupAndExit(1);
    }
}

runTests();
