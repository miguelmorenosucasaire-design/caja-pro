const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare('SELECT id, comprobante, fecha, tipo, estado, nombre, carrera, monto, concepto FROM movimientos ORDER BY id ASC').all();
console.log('Total movimientos in DB:', rows.length);
console.log('Comprobantes in DB sample:', rows.slice(0, 10).map(r => `${r.comprobante}: ${r.nombre} (${r.monto})`));
console.log('Last 10 comprobantes in DB:', rows.slice(-10).map(r => `${r.comprobante}: ${r.nombre} (${r.monto})`));

const sumTotal = db.prepare("SELECT sum(monto) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;
console.log('Total sum pagado in DB:', sumTotal);

// Check if any receipts from 801 to 807 exist in DB
const lastReceipts = db.prepare("SELECT * FROM movimientos WHERE comprobante LIKE '%801%' OR comprobante LIKE '%802%' OR comprobante LIKE '%803%' OR comprobante LIKE '%804%' OR comprobante LIKE '%805%' OR comprobante LIKE '%806%' OR comprobante LIKE '%807%'").all();
console.log('Receipts 801-807 in DB:', lastReceipts);
