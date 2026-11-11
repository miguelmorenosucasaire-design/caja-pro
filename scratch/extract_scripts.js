const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = scriptRegex.exec(content)) !== null) {
    count++;
    const code = match[1];
    const tempFile = `scratch/temp_script_${count}.js`;
    fs.writeFileSync(tempFile, code, 'utf8');
    console.log(`Saved script block ${count} (${code.length} chars) to ${tempFile}`);
}
