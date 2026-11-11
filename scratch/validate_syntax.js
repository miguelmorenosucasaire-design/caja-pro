const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
const jsCode = html.substring(scriptStart + 8, scriptEnd);

try {
    new Function(jsCode);
    console.log('JS syntax is VALID!');
} catch (e) {
    console.error('JS Syntax Error detected:', e.message);
    const lineMatch = e.stack.match(/<anonymous>:(\d+):(\d+)/);
    if (lineMatch) {
        const lineNo = parseInt(lineMatch[1]);
        const lines = jsCode.split('\n');
        console.log('Error around line', lineNo);
        for (let i = Math.max(0, lineNo - 5); i < Math.min(lines.length, lineNo + 5); i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
    }
}
