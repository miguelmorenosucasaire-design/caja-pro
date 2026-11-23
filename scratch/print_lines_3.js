const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 2730; i <= 2770; i++) {
    console.log(`${i}: ${lines[i]}`);
}
