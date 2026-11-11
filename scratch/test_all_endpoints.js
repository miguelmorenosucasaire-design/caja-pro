const http = require('http');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch(e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

async function testAll() {
    const est = await fetchJson('http://127.0.0.1:5000/api/estudiantes');
    console.log('Estudiantes API count:', est.length, 'First student:', est[0]);

    const mov = await fetchJson('http://127.0.0.1:5000/api/movimientos');
    console.log('Movimientos API count:', mov.length, 'First movement:', mov[0]);

    const doc = await fetchJson('http://127.0.0.1:5000/api/docentes');
    console.log('Docentes API count:', doc.length, 'Docentes list:', doc.map(d => `${d.nombre} (${d.carrera})`));

    const grp = await fetchJson('http://127.0.0.1:5000/api/grupos');
    console.log('Grupos API count:', grp.length, 'Grupos list:', grp.map(g => `${g.nombre} -> Encargado: ${g.encargado}`));
}

testAll();
