const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('cargarTodo');
console.log(html.substring(idx - 50, idx + 250));
