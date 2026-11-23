const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const cols = db.prepare("PRAGMA table_info(movimientos)").all();
console.log('Columnas de movimientos:', cols.map(c => c.name));

const rows = db.prepare('SELECT id, comprobante, fecha, nombre, carrera, monto, estado, tipo FROM movimientos ORDER BY id ASC').all();
console.log('Total filas en movimientos:', rows.length);
console.log('Primeras 3 filas:');
console.log(rows.slice(0, 3));
console.log('Últimas 10 filas:');
console.log(rows.slice(-10));
