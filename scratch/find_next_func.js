const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const start = html.indexOf('function renderEstudiantes(lista) {');
console.log('renderEstudiantes at:', start);

const nextFuncMatch = html.substring(start + 50).match(/function\s+[a-zA-Z0-9_]+\s*\(/g);
console.log('Next functions after renderEstudiantes:');
console.log(nextFuncMatch ? nextFuncMatch.slice(0, 5) : 'None');

const nextFuncName = nextFuncMatch[0].replace('function ', '').replace('(', '').trim();
console.log('Exact next function name:', nextFuncName);

const end = html.indexOf('function ' + nextFuncName, start);
console.log('Range of renderEstudiantes:', start, 'to', end);
console.log('Snippet at end:\n', html.substring(end - 100, end + 50));
