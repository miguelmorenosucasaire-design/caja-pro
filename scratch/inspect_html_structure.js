const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('Total HTML length:', html.length);
const mainStart = html.indexOf('<main');
const mainEnd = html.indexOf('</main>');
console.log('Main starts at:', mainStart, 'ends at:', mainEnd);

const scriptStart = html.lastIndexOf('<script>');
console.log('Script starts at:', scriptStart);
