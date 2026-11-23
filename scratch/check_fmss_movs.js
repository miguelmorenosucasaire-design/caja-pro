const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const movs = db.prepare("SELECT * FROM movimientos WHERE nombre LIKE '%fmss%' OR notas LIKE '%fmss%'").all();
console.log('Movs for fmss:', movs);
