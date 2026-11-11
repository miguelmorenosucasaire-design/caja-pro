const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /async\s+function\s+cargarGrupos|function\s+cargarGrupos/g;
let m;
while ((m = regex.exec(html)) !== null) {
    console.log('Found:', m[0], 'at index:', m.index);
    console.log(html.substring(m.index, m.index + 200));
}
