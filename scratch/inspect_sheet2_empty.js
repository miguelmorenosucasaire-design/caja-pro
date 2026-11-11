const fs = require('fs');
const s2 = fs.readFileSync('scratch/excel_unpacked/xl/worksheets/sheet2.xml', 'utf8');

const r200 = s2.match(/<row [^>]*r="200"[^>]*>[\s\S]*?<\/row>/);
console.log('ESTUDIANTES row 200:');
console.log(r200 ? r200[0] : 'not found');
