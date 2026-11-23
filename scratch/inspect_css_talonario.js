const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex1 = /\.talonario-modal-hoja[\s\S]*?\{[\s\S]*?\}/g;
let m;
while ((m = regex1.exec(html)) !== null) {
  console.log(m[0]);
}

const regex2 = /\.recibo-mini-talonario[\s\S]*?\{[\s\S]*?\}/g;
while ((m = regex2.exec(html)) !== null) {
  console.log(m[0]);
}
