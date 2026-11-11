const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare(`
    SELECT fecha, COUNT(*) as movs_count, COUNT(DISTINCT nombre) as alumnos_count
    FROM movimientos
    GROUP BY fecha
    ORDER BY fecha ASC
`).all();

console.log('Movimientos por fecha:', rows);
