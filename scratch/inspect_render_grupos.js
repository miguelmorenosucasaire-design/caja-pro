const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const sIdx = content.indexOf('function renderSidebarSecciones(');
if (sIdx !== -1) {
    console.log(content.slice(sIdx, sIdx + 2000));
}

const tIdx = content.indexOf('function renderTabsSecciones(');
if (tIdx !== -1) {
    console.log(content.slice(tIdx, tIdx + 1500));
}
