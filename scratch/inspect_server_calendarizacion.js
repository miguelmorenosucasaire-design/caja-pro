const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const idx = s.indexOf('/api/estudiantes/calendarizacion');
console.log(s.substring(idx, idx + 1500));
