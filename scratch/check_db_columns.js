const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('--- Table info: estudiantes ---');
console.log(db.prepare("PRAGMA table_info(estudiantes)").all());

console.log('--- Table info: movimientos ---');
console.log(db.prepare("PRAGMA table_info(movimientos)").all());
