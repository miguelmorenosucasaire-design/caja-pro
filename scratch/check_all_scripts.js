const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
    count++;
    console.log(`\n=== SCRIPT BLOCK #${count} ===`);
    console.log(`Length: ${match[1].length} chars`);
    const preview = match[1].trim().substring(0, 150);
    console.log(`Start: ${preview}...`);
    try {
        const vm = require('vm');
        new vm.Script(match[1]);
        console.log(`Block #${count}: VALID syntax!`);
    } catch (e) {
        console.log(`Block #${count} ERROR:`, e.message);
        // Let's print the line with error
        const lines = match[1].split('\n');
        const stackMatch = e.stack.match(/evalmachine\.<anonymous>:(\d+)/);
        if (stackMatch) {
            const lineNo = parseInt(stackMatch[1]);
            console.log(`Error near line ${lineNo}:`);
            for (let i = Math.max(0, lineNo - 6); i < Math.min(lines.length, lineNo + 6); i++) {
                console.log(`${i + 1}: ${lines[i]}`);
            }
        }
    }
}
console.log(`\nTotal script blocks: ${count}`);
