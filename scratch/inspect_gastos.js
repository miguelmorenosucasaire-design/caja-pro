const fs = require('fs');
const sXml = fs.readFileSync('scratch/excel_unpacked/xl/worksheets/sheet4.xml', 'utf8');
const rows = [...sXml.matchAll(/<row [^>]*r="(\d+)"[^>]*>[\s\S]*?<\/row>/g)];
console.log('Total rows in GASTOS (sheet4.xml):', rows.length);
console.log('First 5 rows:');
rows.slice(0, 5).forEach(r => console.log('Row ' + r[1]));
console.log('Row 6 (first data row):', rows[1] ? rows[1][0] : 'none');
