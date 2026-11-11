const fs = require('fs');
const AdmZip = require('adm-zip');

function inspectZip(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log('File does not exist:', filePath);
        return;
    }
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries();
    console.log(`\n=== Inspecting: ${filePath} ===`);
    const wbEntry = entries.find(e => e.entryName === 'xl/workbook.xml');
    if (wbEntry) {
        const text = wbEntry.getData().toString('utf8');
        const sheetMatches = text.match(/<sheet [^>]*name="([^"]+)"[^>]*>/g);
        console.log('Sheets found:');
        if (sheetMatches) {
            sheetMatches.forEach(s => {
                const name = s.match(/name="([^"]+)"/)[1];
                console.log(' - ' + name);
            });
        }
    }
}

inspectZip('CEPRO_Micaela_Bastidas_Control_Actualizado.xlsm');
inspectZip('CEPRO_Micaela_Bastidas_Control_PLANTILLA_LIMPIA.xlsm');
