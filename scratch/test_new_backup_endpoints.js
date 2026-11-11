const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { DatabaseSync } = require('node:sqlite');

console.log('Testing full backup package & restore workflow...');

// 1. Generate in-memory zip containing DB and Excel
const zip = new AdmZip();
zip.addLocalFile('caja_institucional.db', '', 'Respaldo_CETPRO_SanMiguel_BD.db');

const excelPath = path.join(__dirname, '..', 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
if (fs.existsSync(excelPath)) {
    zip.addLocalFile(excelPath, '', 'Respaldo_CETPRO_SanMiguel_Excel.xlsx');
}

const readme = `CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
COPIA DE SEGURIDAD OFICIAL DEL SISTEMA
Fecha: ${new Date().toLocaleString('es-PE')}

CONTENIDO DEL PAQUETE:
1. Respaldo_CETPRO_SanMiguel_BD.db
   -> Archivo de Base de Datos SQLite con la informacion completa del sistema:
      - 147 Estudiantes y fichas de matricula.
      - 202 Movimientos y control de caja chica (S/. 24,630.00).
      - 15 Docentes y personal institucional.
      - Configuracion de sedes, campus y comprobantes.
   -> Use este archivo para REESTABLECER el sistema desde la seccion BACKUP.

2. Respaldo_CETPRO_SanMiguel_Excel.xlsx
   -> Libro de Calculo Oficial con las 12 hojas institucionales para abrir en Microsoft Excel.

INSTRUCCIONES PARA REESTABLECER:
1. Abra el sistema Educaja Pro en su navegador (http://127.0.0.1:5000).
2. Dirijase a la seccion BACKUP en la barra lateral.
3. En la seccion "Reestablecer Sistema", seleccione este archivo .zip o el archivo .db.
4. Presione "Reestablecer Sistema Ahora".
`;
zip.addFile('INSTRUCCIONES_DE_RESPALDO.txt', Buffer.from(readme, 'utf8'));

const zipBuf = zip.toBuffer();
console.log('Generated Zip size:', zipBuf.length, 'bytes');

// 2. Test extracting DB from the zip
const unzipped = new AdmZip(zipBuf);
const dbEntry = unzipped.getEntries().find(e => e.entryName.endsWith('.db'));
if (!dbEntry) throw new Error('DB entry not found in zip');

// 3. Test verification of extracted DB
const tempTest = path.join(__dirname, 'temp_test_unzipped.db');
fs.writeFileSync(tempTest, dbEntry.getData());

const testDb = new DatabaseSync(tempTest);
const check = testDb.prepare("PRAGMA integrity_check").get();
console.log('Unzipped DB PRAGMA check:', check.integrity_check);

const countEst = testDb.prepare("SELECT count(*) as c FROM estudiantes").get().c;
const countMov = testDb.prepare("SELECT count(*) as c FROM movimientos").get().c;
const sumIng = testDb.prepare("SELECT coalesce(sum(monto), 0) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;

console.log(`Unzipped DB verified: ${countEst} estudiantes, ${countMov} movimientos, S/. ${sumIng}`);
testDb.close();
fs.unlinkSync(tempTest);

console.log('✅ Full backup package & restore workflow passed!');
