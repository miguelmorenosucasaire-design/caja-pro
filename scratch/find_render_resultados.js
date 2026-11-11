const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /renderResultados\s*\(/g;
let m;
while ((m = regex.exec(html)) !== null) {
    console.log('Called renderResultados at index:', m.index);
    console.log(html.substring(m.index - 50, m.index + 100));
}
