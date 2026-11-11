const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const mIdx = content.indexOf('function mostrarTodasLasSecciones(');
if (mIdx !== -1) {
    console.log(content.slice(mIdx, mIdx + 2000));
}
