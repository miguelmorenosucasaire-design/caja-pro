const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const sPos = html.indexOf('id="section-configuracion"');
const ePos = html.indexOf('</main>');

const sHtml = html.substring(sPos, ePos);

// Count only <div and </div
let lines = sHtml.split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const openMatches = (line.match(/<div\b/g) || []).length;
    const closeMatches = (line.match(/<\/div>/g) || []).length;
    depth += openMatches - closeMatches;
    if (depth < 0) {
        console.log(`Depth dropped below 0 at line ${i+1}: ${line.trim()}`);
        for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 5); j++) {
            console.log(`  ${j+1}: ${lines[j].trim()}`);
        }
        break;
    }
}
console.log('Final div depth in section-configuracion:', depth);
