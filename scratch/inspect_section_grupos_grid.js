const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = content.indexOf('grid grid-cols-1 lg:grid-cols-12 gap-6 items-start');
const endIdx = content.indexOf('<!-- ==========================================', startIdx + 10);
console.log('from grid to end:', endIdx - startIdx);
console.log(content.slice(startIdx, Math.min(content.length, startIdx + 3000)));
