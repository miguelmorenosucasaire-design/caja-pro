const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 2710; i <= 2755; i++) {
    console.log(`${i}: ${lines[i]}`);
}
