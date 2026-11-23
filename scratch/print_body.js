const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 1200; i <= 1320; i++) {
    console.log(`${i}: ${lines[i]}`);
}
