const fs = require('fs');

const server = fs.readFileSync('server.js', 'utf8');
const html = fs.readFileSync('templates/index.html', 'utf8');

console.log('--- SERVER.JS SEARCH FOR sin_asignar / Sin Asignar ---');
const sMatches = server.split('\n').filter(l => l.toLowerCase().includes('asignar') || l.toLowerCase().includes('pendiente'));
sMatches.forEach(l => console.log(l.trim()));

console.log('\n--- INDEX.HTML SEARCH FOR sin_asignar / Sin Asignar ---');
const hMatches = html.split('\n').filter(l => l.toLowerCase().includes('asignar') || l.toLowerCase().includes('sin asignar'));
hMatches.slice(0, 30).forEach(l => console.log(l.trim()));
