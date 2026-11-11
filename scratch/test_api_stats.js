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

async function run() {
    try {
        const stats = await fetchJson('http://127.0.0.1:5000/api/stats');
        console.log('=== API STATS ===');
        console.log('Total Ingresos:', stats.total_ingresos);
        console.log('Total Egresos:', stats.total_egresos);
        console.log('Saldo Actual:', stats.saldo_actual);
        console.log('Total Alumnos:', stats.total_alumnos);
        console.log('\nMeses Detalle:');
        console.table(stats.meses_detalle.map(m => ({
            Mes: m.mes_nombre,
            Ingresos: m.ingresos,
            Egresos: m.egresos,
            Neto: m.neto,
            Saldo_Acum: m.saldo_acumulado,
            Movs: m.movimientos_count
        })));
    } catch(err) {
        console.error('Error fetching API:', err.message);
    }
}

run();
