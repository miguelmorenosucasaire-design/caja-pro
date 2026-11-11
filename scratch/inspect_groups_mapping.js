const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare(`
    SELECT DISTINCT carrera, turno, COUNT(DISTINCT id) as total_estudiantes
    FROM estudiantes
    GROUP BY carrera, turno
    ORDER BY carrera, turno
`).all();

console.log('Unique Carrera and Turno in estudiantes:');
console.table(rows);
