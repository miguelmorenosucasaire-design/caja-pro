const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('Total students assigned:', db.prepare("SELECT count(*) as c FROM estudiantes WHERE grupo != 'General'").get().c);
console.log('Total movements assigned:', db.prepare("SELECT count(*) as c FROM movimientos WHERE grupo != 'General'").get().c);
console.log('Total ingresos:', db.prepare("SELECT sum(monto) as total FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().total);
