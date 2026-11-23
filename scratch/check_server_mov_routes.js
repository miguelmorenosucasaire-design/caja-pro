const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const regex = /app\.(get|post|put|delete)\(['"]\/api\/movimientos[^'"]*['"]/g;
let m;
while ((m = regex.exec(s)) !== null) {
  console.log(m[0]);
}
