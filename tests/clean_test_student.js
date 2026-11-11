const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const del = db.prepare("DELETE FROM estudiantes WHERE id = 509 AND nombre = 'Test'").run();
console.log('Estudiante Test eliminado:', del.changes);

const delCarrera = db.prepare("DELETE FROM carreras WHERE nombre LIKE '%Especialidad_Test_%'").run();
console.log('Carreras test eliminadas:', delCarrera.changes);
