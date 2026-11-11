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

const sGas = sheets.find(x => x.name.toLowerCase() === 'gastos');
const targetFile = path.join(xlDir, relMap[sGas.rId]);
const sXml = fs.readFileSync(targetFile, 'utf8');

const rowMatches = [...sXml.matchAll(/<row [^>]*r="(\d+)"[^>]*>(.*?)<\/row>/gs)];
console.log(`Total rows in GASTOS: ${rowMatches.length}`);

const rowsData = [];
for (let i = 0; i < rowMatches.length; i++) {
    const rowNum = parseInt(rowMatches[i][1], 10);
    if (rowNum < 6) continue;
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

console.log(`Parsed ${rowsData.length} data rows from GASTOS`);
const nonEmpties = rowsData.filter(r => r['C'] || r['H']);
console.log(`Non-empty rows in GASTOS: ${nonEmpties.length}`);
nonEmpties.slice(0, 15).forEach(r => console.log(JSON.stringify(r)));
