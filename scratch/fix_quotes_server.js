const fs = require('fs');

let serverCode = fs.readFileSync('server.js', 'utf8');

const target = `const totalMovs = db.prepare('SELECT count(*) as c, COALESCE(SUM(monto), 0) as sum FROM movimientos WHERE tipo = "Ingreso" AND estado = "Pagado"').get();`;
const fix = `const totalMovs = db.prepare("SELECT count(*) as c, COALESCE(SUM(monto), 0) as sum FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get();`;

if (serverCode.includes(target)) {
    serverCode = serverCode.replace(target, fix);
    fs.writeFileSync('server.js', serverCode, 'utf8');
    console.log('Fixed quotes in /api/sistema/diagnostico-completo query');
} else {
    console.log('Target query not found with exact characters');
}
