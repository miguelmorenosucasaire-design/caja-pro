const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const r = db.prepare("SELECT id, nombre, carrera FROM estudiantes WHERE carrera NOT LIKE '%Pendiente%' AND carrera != 'Sin Asignar'").all();
console.log('Estudiantes con carrera asignada:', r);
