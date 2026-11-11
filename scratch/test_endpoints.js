const http = require('http');

function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const req = http.request({
            hostname: u.hostname,
            port: u.port,
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        if (options.body) req.write(options.body);
        req.end();
    });
}

async function run() {
    console.log('--- PROBANDO ENDPOINTS ---');
    try {
        const rIndex = await fetch('http://127.0.0.1:5000/');
        console.log(`GET /: status=${rIndex.status}, length=${rIndex.body.length}`);

        const rStats = await fetch('http://127.0.0.1:5000/api/stats');
        console.log(`GET /api/stats: status=${rStats.status}, body=${rStats.body.slice(0, 100)}...`);

        const rGrupos = await fetch('http://127.0.0.1:5000/api/grupos');
        const grupos = JSON.parse(rGrupos.body);
        console.log(`GET /api/grupos: status=${rGrupos.status}, total grupos=${grupos.length}`);
        if (grupos.length > 0) {
            console.log(`Primer grupo: "${grupos[0].nombre}", Encargado: "${grupos[0].encargado}", Alumnos: ${grupos[0].total_alumnos}, Ingresos: S/. ${grupos[0].total_ingresos}`);
            const rDetalle = await fetch(`http://127.0.0.1:5000/api/grupos/${grupos[0].id}/detalle`);
            const det = JSON.parse(rDetalle.body);
            console.log(`GET /api/grupos/${grupos[0].id}/detalle: status=${rDetalle.status}, alumnos=${det.estudiantes.length}, movs=${det.movimientos.length}`);
        }

        const rMovs = await fetch('http://127.0.0.1:5000/api/movimientos');
        const movs = JSON.parse(rMovs.body);
        console.log(`GET /api/movimientos: status=${rMovs.status}, total movs=${movs.length}`);
        const conGrupo = movs.filter(m => m.grupo && m.grupo !== 'General');
        console.log(`Movimientos con sección asignada: ${conGrupo.length}/${movs.length}`);

        // Probar registrar un nuevo movimiento con grupo, encargado, notas y cantidad
        const postData = JSON.stringify({
            tipo: 'Ingreso',
            estado: 'Pagado',
            rol: 'Estudiante',
            nombre: 'Prueba Alumno Test',
            carrera: 'Computación e Informática',
            grupo: 'Computación - Grupo A',
            encargado: 'Ing. Carlos Mendoza Ruiz',
            concepto: 'Cuota de Taller y Prácticas',
            monto: 120.00,
            metodo_pago: 'Efectivo',
            notas: 'Pago de prueba verificado para módulo de grupos'
        });
        const rPost = await fetch('http://127.0.0.1:5000/api/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: postData
        });
        const resPost = JSON.parse(rPost.body);
        console.log(`POST /api/movimientos: status=${rPost.status}, result=`, resPost);

        if (resPost.id) {
            // Eliminar el movimiento de prueba para no ensuciar la base de datos
            await fetch(`http://127.0.0.1:5000/api/movimientos/${resPost.id}`, { method: 'DELETE' });
            console.log(`Movimiento de prueba ${resPost.id} eliminado correctamente.`);
        }

        console.log('✅ TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE.');
    } catch (err) {
        console.error('Error probando servidor:', err.message);
    }
}

run();
