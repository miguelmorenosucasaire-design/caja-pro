const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

const idx = code.indexOf("method === 'OPTIONS'");
console.log(code.substring(idx - 100, idx + 400));
