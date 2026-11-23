const http = require('http');

function post(data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: 5000,
            path: '/api/movimientos',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

async function test() {
    const res = await post({
        tipo: 'Ingreso',
        estado: 'Pagado',
        rol: 'Estudiante',
        nombre: 'Ada Merced Jilapa Calsin',
        comprobante: '0000808',
        dni: '75936591',
        turno: 'Mañana',
        carrera: 'Peluquería y Barbería',
        grupo: 'Peluquería y Barbería - Turno Mañana',
        encargado: 'Alejandrina Ayna Cabrera',
        concepto: 'Expedición de constancia de estudio',
        monto: 20.00,
        fecha: '2026-11-15',
        metodo_pago: 'Efectivo',
        notas: 'Constancia regular'
    });
    console.log('Response POST movimiento:', res);

    // Verificar en BD
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync('caja_institucional.db');
    const row = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(res.id);
    console.log('Saved row in DB:', row);

    // Limpieza
    db.prepare("DELETE FROM movimientos WHERE id = ?").run(res.id);
    console.log('Deleted test row cleanly.');
}

test().catch(console.error);
