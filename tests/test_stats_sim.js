// Test simulating the browser execution of cargarStats and renderTablaResultados
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Simulate the data returned by /api/stats
const ingRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado' AND strftime('%Y', fecha) = '2026'").get();
console.log('Ingresos 2026:', ingRow.total);

// Check if any error happens in renderTablaResultados logic
const fMoney = (val) => Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
console.log('fMoney(25080):', fMoney(25080));
