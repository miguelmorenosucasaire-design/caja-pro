const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

db.prepare("DELETE FROM movimientos WHERE nombre = 'TEST ESTUDIANTE AUTO BOLETA'").run();
db.prepare("DELETE FROM estudiantes WHERE nombre = 'TEST ESTUDIANTE AUTO BOLETA'").run();

const movCount = db.prepare("SELECT count(*) as c, sum(monto) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get();
console.log('Movimientos:', movCount.c, 'Suma:', movCount.s);

const estCount = db.prepare("SELECT count(*) as c FROM estudiantes").get();
console.log('Estudiantes:', estCount.c);
