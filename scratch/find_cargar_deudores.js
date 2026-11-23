const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

let idx = html.indexOf('cargarDeudores');
while (idx !== -1) {
  console.log('Match at', idx);
  console.log(html.substring(idx - 50, idx + 400));
  idx = html.indexOf('cargarDeudores', idx + 1);
}
