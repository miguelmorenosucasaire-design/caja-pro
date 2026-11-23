const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
for (let i = 3400; i < lines.length; i++) {
    const l = lines[i];
    if (l && l.includes('id="section-')) {
        console.log(i + 1, l.trim());
        break;
    }
}
