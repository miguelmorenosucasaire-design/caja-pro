const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const AdmZip = require('adm-zip');

console.log('Testing restore logic...');

// 1. Create a zip containing the current db
const zip = new AdmZip();
zip.addLocalFile('caja_institucional.db', '', 'Respaldo_CETPRO_SanMiguel_BD.db');
const zipBuffer = zip.toBuffer();

console.log('Zip buffer length:', zipBuffer.length);

// 2. Extract and verify
const readZip = new AdmZip(zipBuffer);
const dbEntry = readZip.getEntries().find(e => e.entryName.toLowerCase().endsWith('.db'));
if (!dbEntry) throw new Error('No db entry');

const tempVerify = path.join(__dirname, 'temp_test_restore.db');
fs.writeFileSync(tempVerify, dbEntry.getData());

const testDb = new DatabaseSync(tempVerify);
const integrity = testDb.prepare("PRAGMA integrity_check").get();
console.log('Integrity check:', integrity);

const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
console.log('Tables found:', tables.length);

const countEst = testDb.prepare("SELECT count(*) as c FROM estudiantes").get().c;
const countMov = testDb.prepare("SELECT count(*) as c FROM movimientos").get().c;
const sumIng = testDb.prepare("SELECT coalesce(sum(monto), 0) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;
console.log(`Verified stats: ${countEst} estudiantes, ${countMov} movimientos, S/. ${sumIng}`);

testDb.close();
fs.unlinkSync(tempVerify);
console.log('Test completed successfully!');
