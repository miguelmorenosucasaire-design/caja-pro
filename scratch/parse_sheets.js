const fs = require('fs');
const path = require('path');

const xlDir = path.join(__dirname, 'excel_unpacked', 'xl');
const wbXml = fs.readFileSync(path.join(xlDir, 'workbook.xml'), 'utf8');
const sheetMatches = [...wbXml.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*sheetId="([^"]+)"[^>]*r:id="([^"]+)"/g)];
const sheets = sheetMatches.map(m => ({ name: m[1], sheetId: m[2], rId: m[3] }));

console.log('=== LISTA DE HOJAS ===');
sheets.forEach((s, idx) => console.log(`${idx + 1}. ${s.name} (rId: ${s.rId})`));

// Read shared strings
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

function parseSheetRows(sheetName, maxRows = 10) {
    const s = sheets.find(x => x.name.toLowerCase() === sheetName.toLowerCase());
    if (!s) {
        console.log(`Hoja no encontrada: ${sheetName}`);
        return;
    }
    const targetFile = path.join(xlDir, relMap[s.rId]);
    const sXml = fs.readFileSync(targetFile, 'utf8');
    console.log(`\n========================================`);
    console.log(`HOJA: "${s.name}" (${relMap[s.rId]})`);
    console.log(`========================================`);

    const rowMatches = [...sXml.matchAll(/<row [^>]*r="(\d+)"[^>]*>(.*?)<\/row>/gs)];
    console.log(`Total filas con datos: ${rowMatches.length}`);

    for (let i = 0; i < Math.min(maxRows, rowMatches.length); i++) {
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
        console.log(`Fila ${rowNum}:`, cells.join(' | '));
    }
}

['INGRESOS', 'GASTOS', 'ESTUDIANTES', 'DEUDAS', 'DOCENTES', 'GRUPOS', 'RECIBO'].forEach(sh => parseSheetRows(sh, 10));
