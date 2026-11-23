const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('marcarTodosModulosModal');
while (idx !== -1) {
  console.log('Match at', idx);
  console.log(html.substring(idx - 150, idx + 400));
  idx = html.indexOf('marcarTodosModulosModal', idx + 1);
}
