const Database = require('better-sqlite3');
const db = new Database('caja_institucional.db');

try {
    const resumenPorDia = db.prepare(`
        SELECT 
            fecha,
            COUNT(DISTINCT nombre) as total_estudiantes,
            COUNT(*) as total_recibos,
            SUM(monto) as total_monto
        FROM movimientos
        WHERE tipo = 'INGRESO' AND fecha IS NOT NULL AND fecha != ''
        GROUP BY fecha
        ORDER BY fecha DESC
    `).all();
    console.log('Query success! Days found:', resumenPorDia.length);
    console.log('Sample:', resumenPorDia.slice(0, 3));
} catch (e) {
    console.error('Query error:', e);
}

const firstMov = db.prepare("SELECT id, comprobante, nombre FROM movimientos LIMIT 5").all();
console.log('First 5 movs:', firstMov);
