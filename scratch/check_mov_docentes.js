const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const r = db.prepare("SELECT DISTINCT nombre, encargado, rol FROM movimientos WHERE rol = 'Docente' OR (encargado IS NOT NULL AND encargado != '')").all();
console.log('Movimientos con docentes:', r);
