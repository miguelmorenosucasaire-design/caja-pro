const XLSX = require('xlsx');
const wb = XLSX.readFile('C:/Users/MIGUEL/.gemini/antigravity/brain/4ff10259-488d-456c-9048-85e28e72e05f/.user_uploaded/media_1793149104941_bc63b12d.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
for (let i = 0; i < 15; i++) {
    console.log(`Row ${i}:`, data[i]);
}
