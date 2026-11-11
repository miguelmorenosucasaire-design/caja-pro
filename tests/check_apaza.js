const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const res = db.prepare("SELECT codigo, nombre FROM estudiantes WHERE nombre LIKE '%Apaza%'").all();
console.log('Apaza en estudiantes:', res);
