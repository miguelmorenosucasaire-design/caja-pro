const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare(`
    SELECT DISTINCT carrera, turno, COUNT(*) as cant 
    FROM estudiantes 
    GROUP BY carrera, turno 
    ORDER BY carrera, turno
`).all();

console.log('Carrera + Turno combinations:');
rows.forEach(r => console.log(`Carrera: "${r.carrera}" | Turno: "${r.turno}" | Alumnos: ${r.cant}`));
