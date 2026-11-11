const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare("SELECT comprobante FROM movimientos WHERE comprobante IS NOT NULL ORDER BY id DESC LIMIT 10").all();
console.log('Last 10 comprobantes:', rows);

// Highest numeric comprobante
const maxComp = db.prepare("SELECT MAX(CAST(comprobante AS INTEGER)) as max_c FROM movimientos").get();
console.log('Max numeric comprobante:', maxComp);
