const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare("SELECT * FROM estudiantes WHERE id = 720 OR codigo LIKE '%720%' OR nombre LIKE '%fm%'").all();
console.log('Students matching:', rows);

const lastStudents = db.prepare("SELECT * FROM estudiantes ORDER BY id DESC LIMIT 10").all();
console.log('Last 10 students:', lastStudents);
