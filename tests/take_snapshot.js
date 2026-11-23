const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const BACKUPS_DIR = path.join(ROOT, 'backups');

function calcSHA256(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').slice(0, 19);
const dbSrc = path.join(ROOT, 'caja_institucional.db');
const xlsxSrc = path.join(ROOT, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');

const dbDest = path.join(BACKUPS_DIR, `SNAPSHOT_FASE1_ORQUESTADOR_${timestamp}.db`);
const xlsxDest = path.join(BACKUPS_DIR, `SNAPSHOT_FASE1_ORQUESTADOR_${timestamp}.xlsx`);

fs.copyFileSync(dbSrc, dbDest);
const dbHash = calcSHA256(dbDest);
fs.writeFileSync(`${dbDest}.sha256`, `${dbHash}  ${path.basename(dbDest)}\n`);

if (fs.existsSync(xlsxSrc)) {
    fs.copyFileSync(xlsxSrc, xlsxDest);
    const xlsxHash = calcSHA256(xlsxDest);
    fs.writeFileSync(`${xlsxDest}.sha256`, `${xlsxHash}  ${path.basename(xlsxDest)}\n`);
}

console.log('✅ Snapshot de seguridad Fase 1 completado exitosamente:');
console.log('DB:', path.basename(dbDest), 'SHA256:', dbHash.substring(0, 16) + '...');
if (fs.existsSync(xlsxDest)) {
    console.log('XLSX:', path.basename(xlsxDest));
}
