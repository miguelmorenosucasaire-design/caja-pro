const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const integrity = db.prepare('PRAGMA integrity_check').get();
console.log('Integrity check:', integrity);

const movCount = db.prepare('SELECT count(*) as c, sum(monto) as s FROM movimientos').get();
console.log('Movimientos:', movCount);

const estCount = db.prepare('SELECT count(*) as c FROM estudiantes').get();
console.log('Estudiantes:', estCount);

const naCount = db.prepare("SELECT count(*) as c FROM movimientos WHERE fecha = 'N/A'").get();
console.log('Movimientos con fecha N/A:', naCount);

const naList = db.prepare("SELECT comprobante, nombre, fecha, monto FROM movimientos WHERE fecha = 'N/A'").all();
console.log('Lista N/A:', naList);

db.close();
