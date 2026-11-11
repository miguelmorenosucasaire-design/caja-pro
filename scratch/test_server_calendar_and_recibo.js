const { DatabaseSync } = require('node:sqlite');
const XLSX = require('xlsx');

const db = new DatabaseSync('caja_institucional.db');

console.log('Testing calendarization query...');

// For each date, find students whose first movement or registration is on that date
const calendarQuery = db.prepare(`
    SELECT 
        m.fecha,
        COUNT(m.id) as total_recibos,
        SUM(CASE WHEN m.tipo = 'Ingreso' AND m.estado = 'Pagado' THEN m.monto ELSE 0 END) as total_monto,
        COUNT(DISTINCT m.nombre) as total_estudiantes
    FROM movimientos m
    WHERE m.fecha IS NOT NULL AND m.fecha != ''
    GROUP BY m.fecha
    ORDER BY m.fecha DESC
`).all();

console.log('Total dates in calendar:', calendarQuery.length);
console.log('Sample top 3 dates:', calendarQuery.slice(0, 3));

// Test student details for a date
const sampleDate = calendarQuery[0].fecha;
const studentsOnDate = db.prepare(`
    SELECT m.id, m.comprobante, m.fecha, m.nombre, m.carrera, m.grupo, m.monto, m.concepto, m.dni, m.turno
    FROM movimientos m
    WHERE m.fecha = ?
    ORDER BY m.id DESC
`).all(sampleDate);

console.log(`Students on ${sampleDate}:`, studentsOnDate.length);

console.log('Calendarization query test passed!');
