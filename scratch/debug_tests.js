const http = require('http');

function get(path) {
    return new Promise((resolve) => {
        http.get('http://127.0.0.1:5000' + path, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        });
    });
}

async function check() {
    const stats = JSON.parse(await get('/api/stats'));
    console.log('Stats keys:', Object.keys(stats));
    console.log('Stats values:', {
        total_ingresos: stats.total_ingresos,
        alumnos_count: stats.alumnos_count,
        total_alumnos: stats.total_alumnos,
        estudiantes: stats.estudiantes,
        total_estudiantes: stats.total_estudiantes
    });

    const gruposCSV = await get('/api/exportar/hoja?sheet=grupos');
    console.log('\nGrupos CSV sample:\n', gruposCSV.substring(0, 500));
}

check();
