const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
let pos = 0;
while ((pos = code.indexOf('/api/exportar', pos)) !== -1) {
    console.log('pos:', pos, code.slice(pos, pos + 80));
    pos += 1;
}
