const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const regex = /['"](\/api\/[^'"]+)['"]/g;
const routes = new Set();
let m;
while ((m = regex.exec(s)) !== null) {
  routes.add(m[1]);
}
console.log('API routes in server.js:');
routes.forEach(r => console.log(' ', r));
