const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Let's inspect all unique combinations in estudiantes
const estCombos = db.prepare(`
    SELECT DISTINCT carrera, turno, count(*) as count 
    FROM estudiantes 
    GROUP BY carrera, turno 
    ORDER BY carrera, turno
`).all();

console.log('Combinaciones en Estudiantes:');
console.log(estCombos);

// Let's inspect all unique combinations in movimientos
const movCombos = db.prepare(`
    SELECT DISTINCT carrera, turno, encargado, count(*) as count, sum(monto) as total
    FROM movimientos
    GROUP BY carrera, turno, encargado
    ORDER BY carrera, turno
`).all();

console.log('\nCombinaciones en Movimientos:');
console.log(movCombos);
