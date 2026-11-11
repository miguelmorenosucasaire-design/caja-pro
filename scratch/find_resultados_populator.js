const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('tabla-resultados-dedicada');
while (idx !== -1) {
    console.log('Found tabla-resultados-dedicada at index:', idx);
    console.log(html.substring(idx - 100, idx + 400));
    break;
}

const jsMatches = [];
let pos = 0;
while ((pos = html.indexOf('tabla-resultados-dedicada', pos)) !== -1) {
    jsMatches.push(pos);
    pos += 25;
}
console.log('Occurrences of tabla-resultados-dedicada:', jsMatches.length);
if (jsMatches.length > 1) {
    console.log('JS Code using it:');
    console.log(html.substring(jsMatches[1] - 50, jsMatches[1] + 1500));
}
