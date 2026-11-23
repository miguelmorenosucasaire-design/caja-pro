const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 2640; i <= 2690; i++) {
    console.log(`${i}: ${lines[i]}`);
}
