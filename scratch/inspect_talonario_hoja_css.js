const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /\.talonario-modal-hoja\s*\{[\s\S]*?\}/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[0]);
}
