const { DatabaseSync } = require('node:sqlite');
const XLSX = require('xlsx');

// 1. Delete from SQLite
const db = new DatabaseSync('caja_institucional.db');
const delEst = db.prepare("DELETE FROM estudiantes WHERE nombre = 'fmss' OR id = 516").run();
console.log('Deleted from db:', delEst);

// Also check if any movements exist for fmss
const delMov = db.prepare("DELETE FROM movimientos WHERE nombre = 'fmss'").run();
console.log('Deleted movements for fmss:', delMov);

// 2. Delete from Excel
const wb = XLSX.readFile('CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
const sheet = wb.Sheets['ESTUDIANTES'];
if (sheet) {
    const data = XLSX.utils.sheet_to_json(sheet);
    const filtered = data.filter(d => {
        const str = JSON.stringify(d).toLowerCase();
        return !str.includes('fmss');
    });
    console.log('Original count:', data.length, 'Filtered count:', filtered.length);
    const newSheet = XLSX.utils.json_to_sheet(filtered);
    wb.Sheets['ESTUDIANTES'] = newSheet;
    XLSX.writeFile(wb, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
    console.log('Excel updated successfully.');
}
