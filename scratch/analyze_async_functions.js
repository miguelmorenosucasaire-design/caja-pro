const fs = require('fs');
let html = fs.readFileSync('templates/index.html', 'utf8');

// Find all function declarations that have await in their body
// Let's analyze line by line or function by function
const lines = html.split('\n');
console.log('Total lines in index.html:', lines.length);

// Let's identify the lines with function declarations
const fixes = [];
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*(function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{)/);
    if (match) {
        const fnName = match[2];
        // Scan forward until next function or matching brace to see if await is inside
        let hasAwait = false;
        let depth = 0;
        for (let j = i; j < Math.min(lines.length, i + 300); j++) {
            if (lines[j].includes('{')) depth += (lines[j].match(/\{/g) || []).length;
            if (lines[j].includes('}')) depth -= (lines[j].match(/\}/g) || []).length;
            if (lines[j].includes('await ') && j > i) {
                hasAwait = true;
                break;
            }
            if (depth <= 0 && j > i) break;
        }
        if (hasAwait) {
            fixes.push({ lineIndex: i, fnName, oldLine: line });
        }
    }
}

console.log('Found functions needing async:', fixes.map(f => f.fnName));
