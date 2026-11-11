const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare('SELECT DISTINCT carrera, COUNT(*) as c FROM movimientos GROUP BY carrera').all();
console.log('Movimientos by carrera:');
console.table(rows);

const grupos = db.prepare('SELECT DISTINCT grupo, COUNT(*) as c FROM movimientos GROUP BY grupo').all();
console.log('Movimientos by grupo:');
console.table(grupos);
