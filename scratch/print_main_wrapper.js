const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 1380; i <= 1490; i++) {
    console.log(`${i}: ${lines[i]}`);
}
