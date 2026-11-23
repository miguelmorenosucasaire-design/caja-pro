const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /<section[^>]+id="[^"]*estudiante[^"]*"[^>]*>/gi;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(m[0]);
}
