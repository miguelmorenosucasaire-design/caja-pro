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

function inspectFormulas(sheetName) {
    const s = sheets.find(x => x.name.toLowerCase() === sheetName.toLowerCase());
    if (!s) return;
    const targetFile = path.join(xlDir, relMap[s.rId]);
    const sXml = fs.readFileSync(targetFile, 'utf8');
    console.log(`\n=== FÓRMULAS EN HOJA "${s.name}" ===`);
    const fMatches = [...sXml.matchAll(/<c r="([A-Z]+\d+)"[^>]*>.*?<f>([^<]+)<\/f>/gs)];
    const formulasByCol = {};
    for (const m of fMatches) {
        const cell = m[1];
        const col = cell.replace(/\d+/, '');
        if (!formulasByCol[col]) {
            formulasByCol[col] = { cell, formula: m[2] };
        }
    }
    for (const col in formulasByCol) {
        console.log(`Col ${col} (ej: ${formulasByCol[col].cell}): =${formulasByCol[col].formula}`);
    }
}

inspectFormulas('INGRESOS');
inspectFormulas('ESTUDIANTES');
inspectFormulas('DOCENTES');
inspectFormulas('GRUPOS');
inspectFormulas('RESUMEN_ANUAL');
