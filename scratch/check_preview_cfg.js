const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('preview-cfg-')) {
        console.log((i+1) + ': ' + lines[i].trim().substring(0, 100));
    }
}
