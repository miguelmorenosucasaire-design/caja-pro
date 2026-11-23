const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /factura-dni/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Match at', m.index);
  console.log(html.substring(m.index - 80, m.index + 200));
}
