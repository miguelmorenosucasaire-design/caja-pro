const fs = require('fs');
const s = fs.readFileSync('templates/index.html', 'utf8');

const navStart = s.indexOf('<nav class="flex-1');
const navEnd = s.indexOf('</nav>');
console.log(s.slice(navStart, navEnd + 6));
