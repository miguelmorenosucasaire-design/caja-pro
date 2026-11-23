const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const r = db.prepare("SELECT * FROM estudiantes WHERE nombre LIKE '%fmss%' OR codigo LIKE '%720%'").all();
console.log('DB fmss matches:', r);

const xlsx = require('xlsx');
const wb = xlsx.readFile('CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
const sheet = wb.Sheets['ESTUDIANTES'];
const rows = xlsx.utils.sheet_to_json(sheet);
const foundInExcel = rows.filter(row => JSON.stringify(row).toLowerCase().includes('fmss'));
console.log('Excel fmss matches:', foundInExcel);
console.log('Total students in DB:', db.prepare('SELECT count(*) as c FROM estudiantes').get().c);
console.log('Total students in Excel:', rows.length);
