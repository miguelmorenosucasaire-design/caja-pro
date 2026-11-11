const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const tableInfo = db.prepare("PRAGMA table_info(movimientos)").all();
console.log('Columns in movimientos:');
console.log(tableInfo.map(c => c.name));

const tableEst = db.prepare("PRAGMA table_info(estudiantes)").all();
console.log('Columns in estudiantes:');
console.log(tableEst.map(c => c.name));
