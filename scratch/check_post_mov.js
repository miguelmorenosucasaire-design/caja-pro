const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8').split('\n');
s.forEach((l, i) => {
    if (l.includes("'/api/movimientos'") && l.includes("method === 'POST'")) {
        console.log('Line for POST movimientos:', i + 1);
        console.log(s.slice(i, i + 50).join('\n'));
    }
});
