const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('Docentes:');
console.table(db.prepare("SELECT * FROM docentes").all());

console.log('\nGrupos:');
console.table(db.prepare("SELECT * FROM grupos").all());
