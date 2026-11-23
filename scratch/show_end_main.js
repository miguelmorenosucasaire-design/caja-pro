const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 3030; i <= 3065; i++) {
    console.log(`${i}: ${lines[i]}`);
}
