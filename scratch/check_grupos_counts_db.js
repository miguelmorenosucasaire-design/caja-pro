const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare(`
    SELECT 
        g.id, g.nombre, g.carrera, g.turno,
        (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as total_alumnos
    FROM grupos g
    ORDER BY g.id ASC
`).all();

console.log(rows);
