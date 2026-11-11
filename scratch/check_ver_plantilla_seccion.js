const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function verPlantillaSeccion')) {
        console.log(`verPlantillaSeccion at line ${i + 1}`);
        console.log(lines.slice(i, i + 40).join('\n'));
        break;
    }
}
