const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Search for abrirModalAsignarCarrera in html
const occurrences = [];
let pos = 0;
while ((pos = html.indexOf('abrirModalAsignarCarrera', pos)) !== -1) {
    occurrences.push(pos);
    pos += 24;
}

console.log('Occurrences of abrirModalAsignarCarrera:', occurrences.length);
occurrences.forEach((p, idx) => {
    console.log(`\n--- Occurrence ${idx + 1} at pos ${p} ---`);
    console.log(html.substring(Math.max(0, p - 100), Math.min(html.length, p + 250)));
});
