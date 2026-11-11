const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

db.prepare("UPDATE estudiantes SET carrera = 'Sin Asignar (Pendiente)', grupo = 'Sin Asignar' WHERE id = 52").run();
db.prepare("UPDATE movimientos SET carrera = 'Sin Asignar (Pendiente)', grupo = 'Sin Asignar' WHERE LOWER(TRIM(nombre)) = LOWER(TRIM('Alan Ronald Hallasi Morales'))").run();

const unassigned = db.prepare("SELECT COUNT(*) as c FROM estudiantes WHERE carrera = 'Sin Asignar (Pendiente)'").get().c;
console.log('Todos los estudiantes sin asignar:', unassigned, '/ 147');
