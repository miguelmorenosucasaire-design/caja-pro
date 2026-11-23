const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
console.log('--- ESTUDIANTES ---');
console.log(db.prepare("SELECT * FROM estudiantes WHERE nombre LIKE ?").all('%Ada Merced%'));
console.log('--- MOVIMIENTOS ---');
console.log(db.prepare("SELECT * FROM movimientos WHERE nombre LIKE ?").all('%Ada Merced%'));
