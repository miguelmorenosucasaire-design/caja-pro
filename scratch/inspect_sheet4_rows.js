const fs = require('fs');
const s4 = fs.readFileSync('scratch/excel_unpacked/xl/worksheets/sheet4.xml', 'utf8');

const r6 = s4.match(/<row [^>]*r="6"[^>]*>[\s\S]*?<\/row>/);
console.log('GASTOS row 6:');
console.log(r6 ? r6[0] : 'not found');

const r300 = s4.match(/<row [^>]*r="300"[^>]*>[\s\S]*?<\/row>/);
console.log('\nGASTOS row 300:');
console.log(r300 ? r300[0] : 'not found');
