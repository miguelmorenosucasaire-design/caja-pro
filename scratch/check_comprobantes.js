const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const row = db.prepare("SELECT id, comprobante, nombre, monto, fecha, notas FROM movimientos ORDER BY id DESC LIMIT 5").all();
console.log('Últimos movimientos:', row);

const maxComp = db.prepare("SELECT MAX(CAST(REPLACE(comprobante, 'REC-', '') AS INTEGER)) as max_c FROM movimientos").get();
console.log('Max comprobante numérico:', maxComp);
