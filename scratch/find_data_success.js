const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const idx = html.indexOf('if (data.success)');
console.log('idx:', idx);
console.log(html.slice(idx - 50, idx + 800));
