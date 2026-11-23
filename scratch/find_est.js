const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8').split('\n');
s.forEach((l, i) => {
    if (l.includes("'/api/estudiantes'") && l.includes("method === 'GET'")) {
        console.log('Line:', i + 1);
        console.log(s.slice(i, i + 35).join('\n'));
    }
});
