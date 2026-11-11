const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare("SELECT id, tipo, estado, fecha, monto, comprobante, nombre FROM movimientos LIMIT 5").all();
console.log('First 5 rows in movimientos:');
console.log(rows);

const count = db.prepare("SELECT count(*) as c FROM movimientos").get();
console.log('Total count:', count);

const tipos = db.prepare("SELECT DISTINCT tipo FROM movimientos").all();
console.log('Distinct tipos:', tipos);
