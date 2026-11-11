const XLSX = require('xlsx');
const wb = XLSX.readFile('C:/Users/MIGUEL/.gemini/antigravity/brain/4ff10259-488d-456c-9048-85e28e72e05f/.user_uploaded/media_1793149104941_bc63b12d.xlsx');
console.log('Sheet names:', wb.SheetNames);
for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    console.log(`Sheet: ${sheetName}, Rows: ${data.length}`);
    if (data.length > 0) {
        console.log('Row 0:', data[0]);
        if (data.length > 1) console.log('Row 1:', data[1]);
        if (data.length > 2) console.log('Row 2:', data[2]);
    }
}
