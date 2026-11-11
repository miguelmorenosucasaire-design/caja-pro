const fs = require('fs');
const path = require('path');

const xlDir = path.join(__dirname, 'excel_unpacked', 'xl');

let sharedStrings = [];
if (fs.existsSync(path.join(xlDir, 'sharedStrings.xml'))) {
    const ssXml = fs.readFileSync(path.join(xlDir, 'sharedStrings.xml'), 'utf8');
    const siMatches = ssXml.split('</si>');
    for (const si of siMatches) {
        const tMatches = [...si.matchAll(/<t[^>]*>([^<]*)<\/t>/g)];
        if (tMatches.length > 0) {
            sharedStrings.push(tMatches.map(m => m[1]).join(''));
        }
    }
}

const relsXml = fs.readFileSync(path.join(xlDir, '_rels', 'workbook.xml.rels'), 'utf8');
const relMatches = [...relsXml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)];
const relMap = {};
relMatches.forEach(m => relMap[m[1]] = m[2]);

const wbXml = fs.readFileSync(path.join(xlDir, 'workbook.xml'), 'utf8');
const sheetMatches = [...wbXml.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*sheetId="([^"]+)"[^>]*r:id="([^"]+)"/g)];
const sheets = sheetMatches.map(m => ({ name: m[1], sheetId: m[2], rId: m[3] }));

const sIng = sheets.find(x => x.name.toLowerCase() === 'ingresos');
const targetFile = path.join(xlDir, relMap[sIng.rId]);
const sXml = fs.readFileSync(targetFile, 'utf8');

const rowMatches = [...sXml.matchAll(/<row [^>]*r="(\d+)"[^>]*>(.*?)<\/row>/gs)];
console.log(`Total rows in INGRESOS: ${rowMatches.length}`);

const rowsData = [];
for (let i = 0; i < rowMatches.length; i++) {
    const rowNum = parseInt(rowMatches[i][1], 10);
    if (rowNum < 6) continue; // headers
    const rowContent = rowMatches[i][2];
    const cellMatches = [...rowContent.matchAll(/<c r="([A-Z]+\d+)"([^>]*)>(.*?)<\/c>/gs)];
    const rowObj = { _row: rowNum };
    for (const c of cellMatches) {
        const col = c[1].replace(/\d+/, '');
        const isString = c[2].includes('t="s"');
        const vMatch = c[3].match(/<v>([^<]*)<\/v>/);
        let val = vMatch ? vMatch[1] : '';
        if (isString && sharedStrings[parseInt(val)]) {
            val = sharedStrings[parseInt(val)];
        }
        rowObj[col] = val;
    }
    rowsData.push(rowObj);
}

console.log(`Parsed ${rowsData.length} data rows from INGRESOS`);
console.log('Sample row:', rowsData[0]);

// Let's see months distribution
const months = {};
rowsData.forEach(r => {
    const m = r['L'] || r['I'] || 'UNKNOWN';
    months[m] = (months[m] || 0) + 1;
});
console.log('Months in INGRESOS:', months);

// Check if any receipts match 601, 602, etc.
const with600 = rowsData.filter(r => {
    const txt = JSON.stringify(r);
    return txt.includes('601') || txt.includes('Yana') || txt.includes('Hilasaca');
});
console.log(`Rows matching photo names: ${with600.length}`);
if (with600.length > 0) {
    console.log(with600.slice(0, 5));
}
