const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /function\s+([a-zA-Z0-9_]*docente[a-zA-Z0-9_]*)/gi;
let m;
while ((m = regex.exec(html)) !== null) {
    console.log('Match:', m[0], 'at index:', m.index);
}
