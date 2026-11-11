const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

db.prepare("UPDATE carreras SET nombre = 'Corte y Ensamblaje' WHERE nombre = 'Corte y Confección de Prendas'").run();
db.prepare("UPDATE docentes SET carrera = 'Corte y Ensamblaje' WHERE carrera = 'Corte y Confección de Prendas'").run();

const rows = db.prepare('SELECT id, nombre FROM carreras ORDER BY id').all();
console.table(rows);
