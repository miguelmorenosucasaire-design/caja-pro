const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regexImg = /<img[^>]+id="(img-minedu[^"]*|img-modal-minedu[^"]*|img-escudo[^"]*)"[^>]*>/gi;
let m;
while ((m = regexImg.exec(html)) !== null) {
  console.log(m[0]);
}
