const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const lastEst = db.prepare("SELECT * FROM estudiantes ORDER BY id DESC LIMIT 5").all();
console.log(lastEst);
