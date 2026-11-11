const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = content.indexOf('id="section-grupos"');
const endIdx = content.indexOf('<!-- ==========================================', startIdx + 10);
console.log('section-grupos length:', endIdx - startIdx);
console.log(content.slice(startIdx, Math.min(endIdx, startIdx + 3000)));
