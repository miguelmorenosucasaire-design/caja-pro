const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const est = db.prepare('SELECT count(*) as c FROM estudiantes').get().c;
const grp = db.prepare('SELECT count(*) as c FROM grupos').get().c;
const mov = db.prepare('SELECT count(*) as c FROM movimientos').get().c;
const total = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo = 'Ingreso'").get().s;

console.log('--- ESTADO FINAL INSTITUCIONAL ---');
console.log('Estudiantes en Nómina:', est);
console.log('Grupos / Secciones:', grp);
console.log('Comprobantes / Movimientos:', mov);
console.log('Total Recaudado: S/.', total);
