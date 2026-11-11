const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const initMatches = [...html.matchAll(/(window\.onload|addEventListener\('DOMContentLoaded'|cargarTodo|init\(\)|cargarDashboard)[\s\S]*?\n/g)];
console.log('Init matches:');
initMatches.forEach(m => console.log(m[0]));

// Search for the end of Script 1
const script1 = html.split('<script>')[2];
const lines = script1.split('\n');
console.log('Last 30 lines of main script:');
console.log(lines.slice(-30).join('\n'));
