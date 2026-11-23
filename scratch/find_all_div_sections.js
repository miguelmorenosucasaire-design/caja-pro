const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /id="(section-[^"]+)"/gi;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[1]);
}
