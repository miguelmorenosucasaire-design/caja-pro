const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const dashStart = html.indexOf('id="section-dashboard"');
const resStart = html.indexOf('id="section-resultados"');
const dashHtml = html.substring(dashStart, resStart);

const lines = dashHtml.split('\n');
let balance = 0;
lines.forEach((line, idx) => {
    const opens = (line.match(/<div(?:\s[^>]*)?>/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    balance += opens - closes;
    if (opens !== closes) {
        // console.log(`Line ${idx+1}: opens ${opens}, closes ${closes}, balance ${balance}`);
    }
});

console.log('Balance at end of section-dashboard:', balance);
