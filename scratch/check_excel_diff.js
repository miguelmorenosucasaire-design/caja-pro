const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const dbEst = db.prepare('SELECT nombre FROM estudiantes').all();
const dbNames = new Set(dbEst.map(e => (e.nombre || '').trim().toLowerCase()));

const xlsx = require('xlsx');
const wb = xlsx.readFile('CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
const sheet = wb.Sheets['ESTUDIANTES'];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log('Total in DB:', dbNames.size);
console.log('Total in Excel:', rows.length);

const missingInDB = rows.filter(r => !dbNames.has((r['Apellidos y Nombres del Estudiante'] || '').trim().toLowerCase()));
console.log('In Excel but missing in DB:', missingInDB);
