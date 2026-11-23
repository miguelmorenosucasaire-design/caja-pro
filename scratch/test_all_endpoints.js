const http = require('http');

function fetchJSON(path, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(`http://127.0.0.1:5000${path}`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        });
        req.on('error', reject);
        if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        req.end();
    });
}

async function run() {
    console.log('--- Testeando endpoints del servidor ---');
    
    // 1. GET /api/carreras (verifica docentes_nombres y grupos_encargados)
    const rCarr = await fetchJSON('/api/carreras');
    console.log(`GET /api/carreras: Status ${rCarr.status}, total carreras: ${rCarr.data.length}`);
    if (rCarr.data && rCarr.data.length > 0) {
        const c1 = rCarr.data[0];
        console.log(`Ejemplo carrera: "${c1.nombre}"`);
        console.log(`  docentes_nombres: ${c1.docentes_nombres}`);
        console.log(`  grupos_encargados: ${c1.grupos_encargados}`);
    }

    // 2. GET /api/grupos
    const rGrup = await fetchJSON('/api/grupos');
    console.log(`GET /api/grupos: Status ${rGrup.status}, total grupos: ${rGrup.data.length}`);
    if (rGrup.data && rGrup.data.length > 0) {
        const g1 = rGrup.data[0];
        console.log(`Ejemplo grupo id=${g1.id}: "${g1.nombre}", encargado: "${g1.encargado}"`);
        
        // 3. Test POST /api/grupos/:id/encargado
        const rUpdate = await fetchJSON(`/api/grupos/${g1.id}/encargado`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: { encargado: g1.encargado } // mantenemos el mismo encargado
        });
        console.log(`POST /api/grupos/${g1.id}/encargado: Status ${rUpdate.status}, success: ${rUpdate.data.success}`);
    }

    // 4. GET / (Index HTML)
    const rIndex = await fetchJSON('/');
    console.log(`GET /: Status ${rIndex.status}, HTML bytes: ${rIndex.raw ? rIndex.raw.length : 0}`);
}

run().catch(console.error);
