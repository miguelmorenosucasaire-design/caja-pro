const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const lines = html.split('\n');

for (let i = 2648; i <= 2686; i++) {
    console.log(`${i+1}: ${JSON.stringify(lines[i])}`);
}
