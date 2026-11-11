const fs = require('fs');
const path = require('path');

const ssXml = fs.readFileSync('scratch/excel_unpacked/xl/sharedStrings.xml', 'utf8');
const countMatch = ssXml.match(/count="(\d+)"\s+uniqueCount="(\d+)"/);
console.log('SharedStrings counts:', countMatch ? countMatch[0] : 'not found');
