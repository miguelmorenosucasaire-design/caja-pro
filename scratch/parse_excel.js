const fs = require('fs');
const path = require('path');

const xlDir = path.join(__dirname, 'excel_unpacked', 'xl');

// Read workbook.xml to get sheet names
const wbXml = fs.readFileSync(path.join(xlDir, 'workbook.xml'), 'utf8');
const sheetMatches = [...wbXml.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*sheetId="([^"]+)"[^>]*r:id="([^"]+)"/g)];
console.log('=== HOJAS DEL EXCEL ===');
const sheets = sheetMatches.map(m => ({ name: m[1], sheetId: m[2], rId: m[3] }));
console.log(sheets);

// Read shared strings
let sharedStrings = [];
if (fs.existsSync(path.join(xlDir, 'sharedStrings.xml'))) {
    const ssXml = fs.readFileSync(path.join(xlDir, 'sharedStrings.xml'), 'utf8');
    // Extract text inside <si> ... <t> or <t ...>
    const siMatches = ssXml.split('</si>');
    for (const si of siMatches) {
        const tMatches = [...si.matchAll(/<t[^>]*>([^<]*)<\/t>/g)];
        if (tMatches.length > 0) {
            sharedStrings.push(tMatches.map(m => m[1]).join(''));
        }
    }
}
console.log(`Shared strings count: ${sharedStrings.length}`);

// Read sheet_rels to map rId to filename
const relsXml = fs.readFileSync(path.join(xlDir, '_rels', 'workbook.xml.rels'), 'utf8');
const relMatches = [...relsXml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)];
const relMap = {};
relMatches.forEach(m => relMap[m[1]] = m[2]);

// For each sheet, parse top rows to inspect structure
for (const s of sheets) {
    const targetFile = path.join(xlDir, relMap[s.rId]);
    if (!fs.existsSync(targetFile)) continue;
    const sXml = fs.readFileSync(targetFile, 'utf8');
    console.log(`\n--- HOJA: "${s.name}" (${relMap[s.rId]}) ---`);

    // Parse rows
    const rowMatches = [...sXml.matchAll(/<row [^>]*r="(\d+)"[^>]*>(.*?)<\/row>/gs)];
    console.log(`Total filas en hoja: ${rowMatches.length}`);

    // Print first 15 rows
    for (let i = 0; i < Math.min(15, rowMatches.length); i++) {
        const rowNum = rowMatches[i][1];
        const rowContent = rowMatches[i][2];
        const cellMatches = [...rowContent.matchAll(/<c r="([A-Z]+\d+)"([^>]*)>(.*?)<\/c>/gs)];
        const cells = [];
        for (const c of cellMatches) {
            const cellRef = c[1];
            const cellAttrs = c[2];
            const cellValRaw = c[3];
            const isString = cellAttrs.includes('t="s"');
            const vMatch = cellValRaw.match(/<v>([^<]*)<\/v>/);
            let val = vMatch ? vMatch[1] : '';
            if (isString && sharedStrings[parseInt(val)]) {
                val = sharedStrings[parseInt(val)];
            }
            cells.push(`${cellRef}: ${val}`);
        }
        console.log(`Fila ${rowNum}:`, cells.slice(0, 10).join(' | '));
    }
}
