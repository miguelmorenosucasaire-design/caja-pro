const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('verFichaEstudiante(${e.id})', pos)) !== -1) {
  console.log('Found verFichaEstudiante at pos:', pos);
  console.log(html.substring(pos - 60, pos + 120));
  pos += 25;
}
