const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('HTML length:', html.length);
console.log('Contains fetch /api/stats:', html.includes('/api/stats'));
console.log('Contains fetch /api/movimientos:', html.includes('/api/movimientos'));
console.log('Contains fetch /api/estudiantes:', html.includes('/api/estudiantes'));
console.log('Contains fetch /api/docentes:', html.includes('/api/docentes'));
console.log('Contains fetch /api/grupos:', html.includes('/api/grupos'));
