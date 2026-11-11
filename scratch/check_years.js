const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const rows = db.prepare("SELECT DISTINCT strftime('%Y', fecha) as y FROM movimientos").all();
console.log('Years in movimientos:', rows);

const sampleDates = db.prepare("SELECT fecha FROM movimientos LIMIT 10").all();
console.log('Sample dates:', sampleDates);
