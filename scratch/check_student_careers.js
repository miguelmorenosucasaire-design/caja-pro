const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare('SELECT carrera, COUNT(*) as count FROM estudiantes GROUP BY carrera').all();
console.log('Current student distribution by carrera:');
console.table(rows);

const total = db.prepare('SELECT COUNT(*) as total FROM estudiantes').get().total;
console.log('Total students:', total);
