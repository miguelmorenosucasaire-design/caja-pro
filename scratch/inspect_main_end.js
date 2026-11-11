const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const mainEnd = html.indexOf('</main>');
console.log(html.substring(mainEnd - 800, mainEnd + 100));
