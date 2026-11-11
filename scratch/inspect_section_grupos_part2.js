const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const startIdx = content.indexOf('id="section-grupos"');
const endIdx = content.indexOf('<!-- ==========================================', startIdx + 10);
console.log(content.slice(startIdx + 2000, endIdx));
