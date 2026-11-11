const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const mao = db.prepare("SELECT * FROM estudiantes WHERE nombre LIKE '%Machaca%'").all();
console.log('Machaca en estudiantes:', mao);

const yuly = db.prepare("SELECT * FROM estudiantes WHERE nombre LIKE '%Hilasaca%'").all();
console.log('Hilasaca en estudiantes:', yuly);
