const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
for (let i = 2930; i < 3500; i++) {
    const l = lines[i];
    if (l && l.includes('id="section-')) {
        console.log(i + 1, l.trim());
    }
}
