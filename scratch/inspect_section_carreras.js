const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const cIdx = content.indexOf('id="section-carreras"');
console.log('section-carreras at:', cIdx);
if (cIdx !== -1) {
    console.log(content.slice(cIdx, cIdx + 3000));
}

const jsCarreraIdx = content.indexOf('function renderCarreras');
if (jsCarreraIdx !== -1) {
    console.log('renderCarreras:');
    console.log(content.slice(jsCarreraIdx, jsCarreraIdx + 1500));
}
