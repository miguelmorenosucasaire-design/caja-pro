const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderEstudiantes(');
if (idx !== -1) {
    console.log(html.substring(idx + 2200, idx + 4000));
}
