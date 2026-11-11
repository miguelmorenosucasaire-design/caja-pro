const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const vIdx = content.indexOf('id="vista-todas-secciones"');
if (vIdx !== -1) {
    console.log(content.slice(vIdx, vIdx + 2000));
}
