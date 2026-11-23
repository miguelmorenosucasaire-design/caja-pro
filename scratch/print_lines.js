const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 2635; i <= 2705; i++) {
    console.log(`${i}: ${lines[i]}`);
}
