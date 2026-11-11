const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const idx = content.indexOf('async function cargarTodo(');
console.log('cargarTodo definition:');
console.log(content.slice(idx, idx + 1500));

const domIdx = content.indexOf('DOMContentLoaded');
console.log('DOMContentLoaded:');
console.log(content.slice(domIdx - 50, domIdx + 500));
