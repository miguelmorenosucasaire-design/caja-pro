const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
db.prepare("DELETE FROM movimientos WHERE nombre LIKE '%TEST ESTUDIANTE%'").run();
db.prepare("DELETE FROM estudiantes WHERE nombre LIKE '%TEST ESTUDIANTE%'").run();
console.log('Cleaned test records');
