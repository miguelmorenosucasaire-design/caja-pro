const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables.map(t => t.name));

console.log('\nDistinct carreras in estudiantes:');
console.log(db.prepare("SELECT DISTINCT carrera, COUNT(*) as count FROM estudiantes GROUP BY carrera").all());

console.log('\nDistinct carreras in movimientos:');
console.log(db.prepare("SELECT DISTINCT carrera, COUNT(*) as count FROM movimientos GROUP BY carrera").all());

console.log('\nDistinct carreras in docentes:');
console.log(db.prepare("SELECT DISTINCT carrera, COUNT(*) as count FROM docentes GROUP BY carrera").all());
