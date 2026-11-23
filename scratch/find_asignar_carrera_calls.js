const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('abrirModalAsignarCarrera(${e.id}', pos)) !== -1) {
  console.log('Found at pos:', pos);
  console.log(html.substring(pos - 80, pos + 100));
  pos += 30;
}
