const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function main() {
  const r1 = await get('/api/movimientos');
  console.log('/api/movimientos status:', r1.status);
  const movs = JSON.parse(r1.body);
  console.log('Total movs:', movs.length);

  const r2 = await get('/api/movimientos/proximo-comprobante');
  console.log('/api/movimientos/proximo-comprobante:', r2.body);

  const r3 = await get('/api/estudiantes');
  console.log('/api/estudiantes status:', r3.status);
  const ests = JSON.parse(r3.body);
  console.log('Total estudiantes:', ests.length);

  const r4 = await get('/api/control-pagos');
  console.log('/api/control-pagos status:', r4.status);
}

main().catch(console.error);
