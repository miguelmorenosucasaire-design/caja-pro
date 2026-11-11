const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

try {
    const resumenPorDia = db.prepare(`
        SELECT 
            fecha,
            COUNT(DISTINCT nombre) as total_estudiantes,
            COUNT(*) as total_recibos,
            SUM(monto) as total_monto
        FROM movimientos
        WHERE LOWER(tipo) = 'ingreso' AND fecha IS NOT NULL AND fecha != ''
        GROUP BY fecha
        ORDER BY fecha DESC
    `).all();
    console.log('resumenPorDia count:', resumenPorDia.length);

    const stmtDetalle = db.prepare(`
        SELECT id, comprobante, nombre, dni, carrera, turno, monto, fecha, categoria, notas
        FROM movimientos
        WHERE LOWER(tipo) = 'ingreso' AND fecha = ?
        ORDER BY id DESC
    `);

    const sample = stmtDetalle.all(resumenPorDia[0].fecha);
    console.log('Sample detalle count for date', resumenPorDia[0].fecha, ':', sample.length);
} catch (e) {
    console.error('Error:', e);
}
