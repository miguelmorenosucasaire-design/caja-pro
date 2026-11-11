const fs = require('fs');
const path = require('path');

const xlDir = path.join(__dirname, 'excel_unpacked', 'xl');
const s2Xml = fs.readFileSync(path.join(xlDir, 'worksheets', 'sheet2.xml'), 'utf8');
const s3Xml = fs.readFileSync(path.join(xlDir, 'worksheets', 'sheet3.xml'), 'utf8');

console.log('sheet2 (ESTUDIANTES) length:', s2Xml.length);
console.log('sheet3 (INGRESOS) length:', s3Xml.length);

// In sheet2, let's see how formulas and values are stored
const r6_s2 = s2Xml.match(/<row [^>]*r="6"[^>]*>[\s\S]*?<\/row>/)[0];
console.log('\nSample row 6 of sheet2:');
console.log(r6_s2);

// In sheet3, sample row 6
const r6_s3 = s3Xml.match(/<row [^>]*r="6"[^>]*>[\s\S]*?<\/row>/)[0];
console.log('\nSample row 6 of sheet3:');
console.log(r6_s3);
