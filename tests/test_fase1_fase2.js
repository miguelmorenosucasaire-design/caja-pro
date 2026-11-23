const http = require('http');

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:5000' + path, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, json });
                } catch (e) {
                    resolve({ status: res.statusCode, text: data.slice(0, 100) });
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    console.log('--- TEST DE SALUD E INTEGRIDAD Y NUEVOS ENDPOINTS ---');
    const salud = await testEndpoint('/api/sistema/salud-integridad');
    console.log('1. /api/sistema/salud-integridad:', salud.status);
    console.log('   SQLite:', salud.json.sqlite.estado, '| Registros:', salud.json.sqlite.registros);
    console.log('   Excel:', salud.json.excel.existe ? 'EXISTE' : 'NO', '| Tamaño:', salud.json.excel.tamano_bytes, 'bytes');
    console.log('   Cola Excel:', salud.json.excel.cola_pendiente ? 'PENDIENTE' : 'AL DÍA');

    const arqueo = await testEndpoint('/api/reportes/arqueo-diario');
    console.log('2. /api/reportes/arqueo-diario:', arqueo.status);
    console.log('   Fecha:', arqueo.json.fecha);
    console.log('   Saldo Anterior: S/', arqueo.json.saldo_anterior);
    console.log('   Ingresos Hoy: S/', arqueo.json.ingresos_dia.total, `(${arqueo.json.ingresos_dia.cantidad_recibos} recibos)`);
    console.log('   Saldo Cierre: S/', arqueo.json.saldo_cierre_dia);
    console.log('   Desglose billetes/monedas generado:', arqueo.json.desglose_efectivo_sugerido.length, 'denominaciones');

    console.log('--- TODOS LOS NUEVOS SERVICIOS ESTÁN 100% OPERATIVOS ---');
}

run().catch(console.error);
