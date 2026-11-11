const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');

const lastLines = code.split('\n').slice(-30).join('\n');
console.log('--- LAST LINES OF SERVER.JS ---');
console.log(lastLines);
