const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /<img[^>]+id="(img-minedu-oficial|img-minedu-copia|img-modal-minedu-oficial|img-modal-minedu-copia)"[^>]*>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Match:', m[0]);
}
