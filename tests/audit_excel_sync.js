// =====================================================================
// EDUCAJA PRO - AUDITORÍA DE GENERACIÓN Y SINCRONIZACIÓN EXCEL MULTI-HOJA
// =====================================================================
const XLSX = require('xlsx');
const path = require('node:path');
const fs = require('node:fs');

const EXCEL_PATH = path.join(__dirname, '..', 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');

console.log('--- INICIANDO AUDITORÍA DE EXCEL OFICIAL ---');

if (!fs.existsSync(EXCEL_PATH)) {
    console.error('❌ Archivo Excel no encontrado en:', EXCEL_PATH);
    process.exit(1);
}

const wb = XLSX.readFile(EXCEL_PATH);
console.log('Hojas en el libro oficial:', wb.SheetNames);

const expectedSheets = ['RESUMEN', 'CAJA_DIARIO', 'ESTUDIANTES', 'DOCENTES', 'SECCIONES'];
let sheetsOk = true;
for (const s of expectedSheets) {
    if (wb.SheetNames.includes(s)) {
        const data = XLSX.utils.sheet_to_json(wb.Sheets[s]);
        console.log(`✔ Hoja "${s}": ${data.length} filas leídas.`);
    } else {
        console.error(`❌ Falta la hoja requerida: "${s}"`);
        sheetsOk = false;
    }
}

if (sheetsOk) {
    console.log('--- AUDITORÍA DE EXCEL APROBADA AL 100% ---');
    process.exit(0);
} else {
    process.exit(1);
}
