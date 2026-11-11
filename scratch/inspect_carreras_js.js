const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('grid-carreras-reporte');
console.log('grid-carreras-reporte at:', idx);
if (idx !== -1) {
    const jsIdx = content.indexOf('grid-carreras-reporte', idx + 50);
    console.log('JS usage:');
    console.log(content.slice(jsIdx - 200, jsIdx + 1200));
}
