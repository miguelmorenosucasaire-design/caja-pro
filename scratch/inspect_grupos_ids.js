const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const gIdx = content.indexOf('id="section-grupos"');
const nextIdx = content.indexOf('id="section-', gIdx + 20);
const sectionGrupos = content.slice(gIdx, nextIdx);

const ids = [...sectionGrupos.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
console.log('IDs in section-grupos:', ids);
