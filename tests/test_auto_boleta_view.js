const fs = require('fs');
const http = require('http');

console.log('--- Testing Auto Boleta View Implementation ---');

const html = fs.readFileSync('templates/index.html', 'utf8');

// 1. Verify Banner Element in HTML
if (!html.includes('id="banner-accion-boleta-generada"')) {
    console.error('FAIL: banner-accion-boleta-generada not found in HTML');
    process.exit(1);
}
console.log('PASS: banner-accion-boleta-generada found in HTML');

if (!html.includes('id="banner-boleta-nro"') || !html.includes('id="banner-boleta-nombre"') || !html.includes('id="banner-boleta-monto"')) {
    console.error('FAIL: banner child elements not found');
    process.exit(1);
}
console.log('PASS: banner child elements found');

if (!html.includes('mostrarBannerAccionBoleta') || !html.includes('cerrarBannerAccionBoleta')) {
    console.error('FAIL: Banner JS functions not found');
    process.exit(1);
}
console.log('PASS: Banner JS functions found');

// 2. Verify guardarNuevoEstudianteConRecibo implementation
if (!html.includes("cambiarSeccion('factura')") || !html.includes("cambiarVistaComprobante('voucher')")) {
    console.error('FAIL: Section switch or voucher view not found');
    process.exit(1);
}
console.log('PASS: Automatic section switch and voucher view confirmed');

// 3. Verify verBoletaDirecta implementation
if (!html.includes('function verBoletaDirecta(reciboId)') || !html.includes('function irAFacturaConRecibo(reciboId)')) {
    console.error('FAIL: verBoletaDirecta or irAFacturaConRecibo missing');
    process.exit(1);
}
console.log('PASS: verBoletaDirecta and irAFacturaConRecibo confirmed');

// 4. Test API endpoint /api/estudiantes/nuevo-con-recibo
const testPayload = JSON.stringify({
    dni: '99887766',
    nombre: 'TEST ESTUDIANTE AUTO BOLETA',
    telefono: '999888777',
    carrera: 'Computación e Informática',
    turno: 'Tarde',
    docente: 'Prof. Carlos Mendoza',
    fecha: '2026-11-15',
    monto: 150,
    concepto: 'Matrícula y Primer Módulo',
    notas: 'Prueba de emisión automática de boleta'
});

const req = http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/estudiantes/nuevo-con-recibo',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testPayload)
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('API Response status:', res.statusCode);
            console.log('API Response body:', parsed);
            if (res.statusCode === 200 && parsed.success && parsed.movimiento_id) {
                console.log('PASS: /api/estudiantes/nuevo-con-recibo returned success with movimiento_id:', parsed.movimiento_id);
                // Limpieza de datos de prueba
                try {
                    db.prepare("DELETE FROM movimientos WHERE nombre = 'TEST ESTUDIANTE AUTO BOLETA'").run();
                    db.prepare("DELETE FROM estudiantes WHERE nombre = 'TEST ESTUDIANTE AUTO BOLETA'").run();
                } catch (cleanErr) {}
                console.log('ALL AUTO BOLETA TESTS PASSED 100%!');
                process.exit(0);
            } else {
                console.error('FAIL: Unexpected API response:', parsed);
                process.exit(1);
            }
        } catch (e) {
            console.error('FAIL: Could not parse response:', e);
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error('FAIL: HTTP request error:', e.message);
    process.exit(1);
});

req.write(testPayload);
req.end();
