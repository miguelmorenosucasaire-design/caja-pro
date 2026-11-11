const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const estCount = db.prepare('SELECT COUNT(*) as c FROM estudiantes').get().c;
const unassigned = db.prepare("SELECT COUNT(*) as c FROM estudiantes WHERE carrera LIKE '%Pendiente%' OR carrera = 'Sin Asignar' OR carrera IS NULL").get().c;
const movCount = db.prepare('SELECT COUNT(*) as c FROM movimientos').get().c;
const totalIngresos = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo = 'Ingreso'").get().s;

console.log('Total estudiantes:', estCount);
console.log('Estudiantes sin asignar (pendiente):', unassigned);
console.log('Total movimientos:', movCount);
console.log('Total ingresos: S/.', Number(totalIngresos).toFixed(2));
