const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const db = new DatabaseSync('caja_institucional.db');

console.log('--- MOVIMIENTOS CON MONTO <= 0 ---');
const movsMontoCero = db.prepare("SELECT id, fecha, comprobante, concepto, nombre, monto, tipo, estado FROM movimientos WHERE monto IS NULL OR monto <= 0").all();
console.log(movsMontoCero);

console.log('--- MOVIMIENTOS CUYO NOMBRE NO ESTA EN ESTUDIANTES ---');
const huerfanos = db.prepare(`
    SELECT m.id, m.comprobante, m.nombre as nombre_mov, m.monto, m.carrera, m.grupo
    FROM movimientos m 
    WHERE m.rol = 'Estudiante' 
      AND LOWER(TRIM(m.nombre)) NOT IN (SELECT LOWER(TRIM(e.nombre)) FROM estudiantes e)
`).all();
console.log(huerfanos);
