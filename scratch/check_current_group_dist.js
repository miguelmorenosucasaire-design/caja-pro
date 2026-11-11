const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('--- MOVIMIENTOS POR GRUPO ---');
console.log(db.prepare('SELECT grupo, COUNT(*) as c, SUM(monto) as total FROM movimientos GROUP BY grupo').all());

console.log('\n--- ESTUDIANTES POR GRUPO ---');
console.log(db.prepare('SELECT grupo, COUNT(*) as c FROM estudiantes GROUP BY grupo').all());
