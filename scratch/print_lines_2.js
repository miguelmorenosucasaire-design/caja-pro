const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 2770; i <= 2820; i++) {
    console.log(`${i}: ${lines[i]}`);
}
