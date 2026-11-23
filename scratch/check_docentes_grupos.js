const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const docentes = db.prepare("SELECT * FROM docentes ORDER BY nombre").all();
console.log('Docentes count:', docentes.length);
console.log('Docentes sample:', docentes.slice(0, 5));

const grupos = db.prepare("SELECT * FROM grupos ORDER BY nombre").all();
console.log('Grupos count:', grupos.length);
console.log('Grupos sample:', grupos.slice(0, 5));
