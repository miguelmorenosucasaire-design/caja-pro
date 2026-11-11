const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const dashStart = html.indexOf('id="section-dashboard"');
const resStart = html.indexOf('id="section-resultados"');
const dashHtml = html.substring(dashStart, resStart);

const lines = dashHtml.split('\n');
let bal = 0;
lines.forEach((l, i) => {
    const o = (l.match(/<div(?:\s[^>]*)?>/g) || []).length;
    const c = (l.match(/<\/div>/g) || []).length;
    bal += o - c;
    console.log(`Line ${i + 1} (bal: ${bal}): ${l.trim().substring(0, 80)}`);
});
