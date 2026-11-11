const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('Tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name));
console.log('Movimientos columns:', db.prepare("PRAGMA table_info(movimientos)").all().map(c => c.name));
console.log('Estudiantes columns:', db.prepare("PRAGMA table_info(estudiantes)").all().map(c => c.name));
console.log('Diario columns:', db.prepare("PRAGMA table_info(diario)").all().map(c => c.name));
