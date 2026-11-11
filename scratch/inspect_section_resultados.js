const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('id="section-resultados"');
const next = html.indexOf('id="section-', start + 25);
console.log('--- SECTION RESULTADOS ---');
console.log(html.substring(start - 20, next > 0 ? next - 30 : start + 3000));
