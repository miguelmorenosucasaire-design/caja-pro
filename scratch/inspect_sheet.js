const fs = require('fs');
const sXml = fs.readFileSync('scratch/excel_unpacked/xl/worksheets/sheet3.xml', 'utf8');
const r6 = sXml.match(/<row [^>]*r="6"[^>]*>[\s\S]*?<\/row>/);
console.log('Row 6 in sheet3.xml (INGRESOS):');
console.log(r6 ? r6[0] : 'not found');

const r5 = sXml.match(/<row [^>]*r="5"[^>]*>[\s\S]*?<\/row>/);
console.log('Row 5 (Headers):');
console.log(r5 ? r5[0] : 'not found');
