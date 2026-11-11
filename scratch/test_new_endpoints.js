const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: Buffer.concat(data)
            }));
        }).on('error', reject);
    });
}

async function test() {
    console.log('Testing /api/estudiantes/calendarizacion...');
    const cal = await get('http://127.0.0.1:5000/api/estudiantes/calendarizacion');
    console.log('Calendarizacion Status:', cal.statusCode);
    const calJson = JSON.parse(cal.body.toString());
    console.log('Dias registrados:', calJson.dias_registrados);
    if (calJson.calendarizacion && calJson.calendarizacion.length > 0) {
        console.log('Dia 0:', calJson.calendarizacion[0].fecha, 'Total estudiantes:', calJson.calendarizacion[0].total_estudiantes, 'Total monto:', calJson.calendarizacion[0].total_monto);
    }

    console.log('\nTesting /api/movimientos/506/recibo-excel...');
    const exc = await get('http://127.0.0.1:5000/api/movimientos/506/recibo-excel');
    console.log('Excel Status:', exc.statusCode);
    console.log('Content-Type:', exc.headers['content-type']);
    console.log('Content-Disposition:', exc.headers['content-disposition']);
    console.log('Byte length:', exc.body.length);
}

test().catch(console.error);
