const fs = require('fs');
const path = require('path');
const xlDir = path.join(__dirname, 'excel_unpacked', 'xl');

let sharedStrings = [];
if (fs.existsSync(path.join(xlDir, 'sharedStrings.xml'))) {
    const ssXml = fs.readFileSync(path.join(xlDir, 'sharedStrings.xml'), 'utf8');
    const siMatches = ssXml.split('</si>');
    for (const si of siMatches) {
        const tMatches = [...si.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)];
        if (tMatches.length > 0) {
            sharedStrings.push(tMatches.map(m => m[1]).join(''));
        }
    }
}

function dumpSheet(sheetNum, title) {
    const sXml = fs.readFileSync(path.join(xlDir, 'worksheets', `sheet${sheetNum}.xml`), 'utf8');
    const rows = [...sXml.matchAll(/<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)];
    console.log(`\n=== ${title} (sheet${sheetNum}.xml) ===`);
    for (const r of rows) {
        const rowNum = parseInt(r[1]);
        if (rowNum < 5) continue;
        const cells = [...r[2].matchAll(/<c r="([A-Z]+)\d+"(?:[^>]*t="([^"]*)")?[^>]*>(?:<f[^>]*>([^<]*)<\/f>)?(?:<v>([^<]*)<\/v>)?/g)];
        const rowData = {};
        for (const c of cells) {
            const col = c[1];
            const type = c[2];
            const val = c[4];
            if (type === 's' && sharedStrings[parseInt(val)]) {
                rowData[col] = sharedStrings[parseInt(val)];
            } else {
                rowData[col] = val || '';
            }
        }
        console.log(`Row ${rowNum}:`, JSON.stringify(rowData));
    }
}

dumpSheet(10, 'DOCENTES');
dumpSheet(11, 'GRUPOS');
dumpSheet(15, 'CONFIG');
