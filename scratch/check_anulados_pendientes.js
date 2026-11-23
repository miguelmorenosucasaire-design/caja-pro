const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare(`
    SELECT comprobante, fecha, nombre, carrera, monto, estado, concepto, notas 
    FROM movimientos 
    WHERE estado IN ('Anulado', 'Pendiente') 
       OR LOWER(notas) LIKE '%debe%' 
       OR LOWER(notas) LIKE '%cuenta%' 
       OR LOWER(notas) LIKE '%anulado%'
       OR LOWER(concepto) LIKE '%anulado%'
       OR LOWER(nombre) LIKE '%anulado%'
       OR LOWER(nombre) LIKE '%no existe%'
`).all();

console.table(rows);
