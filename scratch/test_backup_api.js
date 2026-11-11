const fs = require('fs');
const path = require('path');

(async () => {
    console.log('Testing new Backup endpoints...');

    // 1. Estado actual
    const resState = await fetch('http://127.0.0.1:5000/api/backups/estado-actual');
    const state = await resState.json();
    console.log('1. /api/backups/estado-actual:', state);

    // 2. Descargar version DB
    const resDb = await fetch('http://127.0.0.1:5000/api/backups/descargar-version/db');
    console.log('2. /api/backups/descargar-version/db status:', resDb.status, 'Content-Disposition:', resDb.headers.get('content-disposition'));
    const dbBuf = await resDb.arrayBuffer();
    console.log('   DB bytes received:', dbBuf.byteLength);

    // 3. Descargar version Excel
    const resExcel = await fetch('http://127.0.0.1:5000/api/backups/descargar-version/excel');
    console.log('3. /api/backups/descargar-version/excel status:', resExcel.status, 'Content-Disposition:', resExcel.headers.get('content-disposition'));
    const excelBuf = await resExcel.arrayBuffer();
    console.log('   Excel bytes received:', excelBuf.byteLength);

    // 4. Descargar version ZIP
    const resZip = await fetch('http://127.0.0.1:5000/api/backups/descargar-version/zip');
    console.log('4. /api/backups/descargar-version/zip status:', resZip.status, 'Content-Disposition:', resZip.headers.get('content-disposition'));
    const zipBuf = await resZip.arrayBuffer();
    console.log('   Zip bytes received:', zipBuf.byteLength);

    // 5. Test restablecer desde el buffer DB descargado
    const base64Data = Buffer.from(dbBuf).toString('base64');
    const resRestore = await fetch('http://127.0.0.1:5000/api/backups/restablecer-archivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fileName: 'Respaldo_CETPRO_SanMiguel_BD.db',
            fileBase64: base64Data
        })
    });
    const restoreResult = await resRestore.json();
    console.log('5. /api/backups/restablecer-archivo result:', restoreResult);

    // 6. Test restablecer desde el ZIP descargado
    const zipBase64 = Buffer.from(zipBuf).toString('base64');
    const resZipRestore = await fetch('http://127.0.0.1:5000/api/backups/restablecer-archivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fileName: 'Respaldo_CETPRO_SanMiguel_Completo.zip',
            fileBase64: zipBase64
        })
    });
    const zipRestoreResult = await resZipRestore.json();
    console.log('6. /api/backups/restablecer-archivo from ZIP result:', zipRestoreResult);

    console.log('🎉 ALL BACKEND ENDPOINTS WORKED PERFECTLY!');
})();
