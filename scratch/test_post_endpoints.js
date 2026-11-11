const http = require('http');

function post(url, data, method = 'POST') {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const u = new URL(url);
        const req = http.request({
            hostname: u.hostname,
            port: u.port,
            path: u.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        }, res => {
            let resp = [];
            res.on('data', chunk => resp.push(chunk));
            res.on('end', () => resolve({
                statusCode: res.statusCode,
                body: Buffer.concat(resp).toString()
            }));
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function testUpdates() {
    console.log('Testing PUT /api/movimientos/506/fecha...');
    const resFecha = await post('http://127.0.0.1:5000/api/movimientos/506/fecha', { fecha: '2026-01-19' }, 'PUT');
    console.log('resFecha status:', resFecha.statusCode, resFecha.body);

    console.log('\nTesting POST /api/estudiantes/nuevo-con-recibo...');
    const testPayload = {
        nombre: 'TEST ESTUDIANTE NUEVO AUTOMATICO',
        dni: '99887766',
        telefono: '987654321',
        carrera: 'Computación e Informática',
        turno: 'Noche',
        grupo: 'Computación e Informática - Turno Noche',
        monto: 150,
        fecha: '2026-11-11',
        concepto: 'Aporte por Mantenimiento Módulo 1',
        notas: 'Inscripción regular con recibo automático de prueba'
    };
    const resNuevo = await post('http://127.0.0.1:5000/api/estudiantes/nuevo-con-recibo', testPayload, 'POST');
    console.log('resNuevo status:', resNuevo.statusCode, resNuevo.body);
}

testUpdates().catch(console.error);
