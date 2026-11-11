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

// Check row 5 headers of sheet3.xml (INGRESOS)
const s3Xml = fs.readFileSync(path.join(xlDir, 'worksheets', 'sheet3.xml'), 'utf8');
const r5_s3 = s3Xml.match(/<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>/)[0];
const cells_s3 = [...r5_s3.matchAll(/<c r="([A-Z]+)5"[^>]*>(?:<v>(\d+)<\/v>)?/g)];
console.log('INGRESOS (sheet3) Headers:');
for (const c of cells_s3) {
    const col = c[1];
    const valIdx = c[2];
    const text = valIdx !== undefined ? sharedStrings[valIdx] : '';
    console.log(`  Col ${col}: "${text}" (index ${valIdx})`);
}

// Check row 5 & 6 of sheet2.xml (ESTUDIANTES)
const s2Xml = fs.readFileSync(path.join(xlDir, 'worksheets', 'sheet2.xml'), 'utf8');
const r5_s2 = s2Xml.match(/<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>/)[0];
const cells_s2 = [...r5_s2.matchAll(/<c r="([A-Z]+)5"[^>]*>(?:<v>(\d+)<\/v>)?/g)];
console.log('\nESTUDIANTES (sheet2) Headers:');
for (const c of cells_s2) {
    const col = c[1];
    const valIdx = c[2];
    const text = valIdx !== undefined ? sharedStrings[valIdx] : '';
    console.log(`  Col ${col}: "${text}" (index ${valIdx})`);
}

const r6_s2 = s2Xml.match(/<row [^>]*r="6"[^>]*>[\s\S]*?<\/row>/);
console.log('\nESTUDIANTES row 6:');
console.log(r6_s2 ? r6_s2[0] : 'not found');
