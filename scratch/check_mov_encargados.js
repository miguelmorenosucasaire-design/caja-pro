const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const enc = db.prepare(`SELECT DISTINCT encargado, COUNT(*) as c FROM movimientos GROUP BY encargado`).all();
console.log('Movimientos encargados:', enc);
const grp = db.prepare(`SELECT DISTINCT grupo, COUNT(*) as c FROM movimientos GROUP BY grupo`).all();
console.log('Movimientos grupos:', grp);
