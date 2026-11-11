const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Let's run the exact stats query from server.js
const movs = db.prepare('SELECT tipo, monto, fecha FROM movimientos').all();
console.log('Total movimientos in DB:', movs.length);
let sumIngresos = 0;
let sumEgresos = 0;
movs.forEach(m => {
    if (m.tipo === 'Ingreso') sumIngresos += m.monto;
    if (m.tipo === 'Egreso') sumEgresos += m.monto;
});
console.log('Sum Ingresos:', sumIngresos, 'Sum Egresos:', sumEgresos, 'Saldo:', sumIngresos - sumEgresos);
