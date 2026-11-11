const fs = require('fs');
const s3 = fs.readFileSync('scratch/excel_unpacked/xl/worksheets/sheet3.xml', 'utf8');

const r500 = s3.match(/<row [^>]*r="500"[^>]*>[\s\S]*?<\/row>/);
console.log('INGRESOS row 500:');
console.log(r500 ? r500[0] : 'not found');
