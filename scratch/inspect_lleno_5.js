const fs = require('fs');
const AdmZip = require('adm-zip');

const filePath = 'c:\\Users\\MIGUEL\\Downloads\\CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm';

console.log('Checking existence of file:', filePath);
if (!fs.existsSync(filePath)) {
    console.log('File does not exist at exact path!');
    // Check Downloads directory for similar files
    const dl = fs.readdirSync('c:\\Users\\MIGUEL\\Downloads');
    console.log('Files in Downloads:', dl.filter(f => f.includes('CEPRO') || f.includes('MICAELA') || f.endsWith('.xlsm') || f.endsWith('.xlsx')));
} else {
    console.log('File EXISTS! Size:', fs.statSync(filePath).size, 'bytes');
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    console.log(`Total entries in zip: ${entries.length}`);
    
    // Workbook sheets
    const wbEntry = entries.find(e => e.entryName === 'xl/workbook.xml');
    if (wbEntry) {
        const text = wbEntry.getData().toString('utf8');
        const sheetMatches = text.match(/<sheet [^>]*name="([^"]+)"[^>]*sheetId="([^"]+)"[^>]*>/g);
        console.log('Sheets in workbook:');
        if (sheetMatches) {
            sheetMatches.forEach(s => {
                const name = s.match(/name="([^"]+)"/)[1];
                const id = s.match(/sheetId="([^"]+)"/)[1];
                console.log(` - Sheet ID ${id}: "${name}"`);
            });
        }
    }
}
