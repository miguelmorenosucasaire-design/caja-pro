const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare("SELECT * FROM estudiantes WHERE nombre LIKE '%fmms%'").all();
console.log('Students matching fmms:', rows);

const movs = db.prepare("SELECT * FROM movimientos WHERE nombre LIKE '%fmms%'").all();
console.log('Movements matching fmms:', movs);
