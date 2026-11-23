const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('tbody-estudiantes', pos)) !== -1) {
  console.log('Found tbody-estudiantes at pos:', pos);
  console.log(html.substring(pos - 50, pos + 300));
  pos += 20;
}
