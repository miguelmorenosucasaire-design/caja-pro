const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const fechas = db.prepare("SELECT DISTINCT fecha FROM movimientos ORDER BY fecha DESC LIMIT 10").all();
console.log('Fechas en movimientos:', fechas);
