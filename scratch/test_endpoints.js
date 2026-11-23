const http = require('node:http');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log('Testing endpoints...');
    const rPend = await fetchJson('http://127.0.0.1:5000/api/estudiantes?estado=pendiente');
    console.log('1. /api/estudiantes?estado=pendiente:', rPend.status, 'Count:', rPend.body.length);
    console.table(rPend.body.map(e => ({ id: e.id, nombre: e.nombre, carrera: e.carrera, estado_financiero: e.estado_financiero, saldo_pendiente: e.saldo_pendiente })));

    const rAnul = await fetchJson('http://127.0.0.1:5000/api/estudiantes?estado=anulado');
    console.log('2. /api/estudiantes?estado=anulado:', rAnul.status, 'Count:', rAnul.body.length);
    console.table(rAnul.body.map(e => ({ id: e.id, codigo: e.codigo, comprobante: e.ultimo_comprobante, nombre: e.nombre, estado_financiero: e.estado_financiero })));

    const rCarr = await fetchJson('http://127.0.0.1:5000/api/carreras');
    console.log('3. /api/carreras:', rCarr.status, 'Count:', rCarr.body.length);

    const rStats = await fetchJson('http://127.0.0.1:5000/api/stats');
    console.log('4. /api/stats:', rStats.status, 'Total Ingresos:', rStats.body.total_ingresos);

    console.log('ALL API TESTS PASSED!');
}

run();
