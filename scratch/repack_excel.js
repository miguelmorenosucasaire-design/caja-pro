const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const unpackedDir = path.resolve(__dirname, 'excel_unpacked');
const downloadsExcel = 'c:\\Users\\MIGUEL\\Downloads\\CEPRO_Micaela_Bastidas_Control-1.xlsm';
const projectExcel = path.resolve(__dirname, '..', 'CEPRO_Micaela_Bastidas_Control_Actualizado.xlsm');
const backupExcel = path.resolve(__dirname, '..', 'backups', 'CEPRO_Micaela_Bastidas_Control-ORIGINAL-BACKUP.xlsm');

// 1. Respaldar el Excel original de Descargas
if (fs.existsSync(downloadsExcel) && !fs.existsSync(backupExcel)) {
    fs.copyFileSync(downloadsExcel, backupExcel);
    console.log(`Respaldo creado en: ${backupExcel}`);
}

// 2. Comprimir excel_unpacked en un nuevo .xlsm usando PowerShell
const tempZip = path.resolve(__dirname, 'repacked_excel.zip');
if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);

const psCommand = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${unpackedDir}', '${tempZip}', [System.IO.Compression.CompressionLevel]::Optimal, $false)"`;
console.log('Comprimiendo carpeta excel_unpacked...');
execSync(psCommand, { stdio: 'inherit' });

if (fs.existsSync(tempZip)) {
    // Copiar a Downloads y al proyecto
    fs.copyFileSync(tempZip, downloadsExcel);
    fs.copyFileSync(tempZip, projectExcel);
    console.log(`Archivo Excel .xlsm actualizado con éxito en:`);
    console.log(`  1. ${downloadsExcel}`);
    console.log(`  2. ${projectExcel}`);
    console.log(`Tamaño final: ${(fs.statSync(projectExcel).size / 1024).toFixed(2)} KB`);
} else {
    console.error('Error: No se generó el archivo comprimido.');
}
