const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Let's inspect rows 801 to 810 in movimientos
const movs = db.prepare("SELECT comprobante, nombre, carrera, monto, fecha, dni, turno FROM movimientos WHERE comprobante IN ('0000801', '0000802', '0000803', '0000804', '0000805', '0000806', '0000807', '0000808', '0000809', '0000810')").all();
console.log('Movs 801-810 en DB:', movs);
