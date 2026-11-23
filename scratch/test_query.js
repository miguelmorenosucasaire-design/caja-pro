const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const rows = db.prepare(`
    SELECT 
        c.id, c.nombre, c.codigo,
        (SELECT GROUP_CONCAT(DISTINCT d.nombre) FROM docentes d WHERE LOWER(TRIM(d.carrera)) = LOWER(TRIM(c.nombre))) as docentes_nombres,
        (SELECT GROUP_CONCAT(DISTINCT g.encargado) FROM grupos g WHERE LOWER(TRIM(g.carrera)) = LOWER(TRIM(c.nombre)) AND g.encargado != 'General' AND g.encargado != 'Por Asignar') as grupos_encargados
    FROM carreras c
    ORDER BY c.nombre ASC
`).all();
console.log(rows);
