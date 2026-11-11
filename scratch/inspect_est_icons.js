const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const idx = s.indexOf('id="section-estudiantes"');
const snippet = s.slice(idx, idx + 4000);
const icons = snippet.match(/<i [^>]*>/g) || [];
console.log('Icons in section-estudiantes:', icons);
