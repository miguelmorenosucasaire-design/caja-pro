const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /(function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{)/g;
let match;
while ((match = regex.exec(html)) !== null) {
    const fnHeader = match[1];
    const fnName = match[2];
    const startIndex = match.index;
    
    // Find matching closing brace or next function
    // Look ahead 1000 characters
    const bodySnippet = html.substring(startIndex, startIndex + 1200);
    if (bodySnippet.includes('await ') && !fnHeader.startsWith('async')) {
        console.log(`⚠️ Function '${fnName}' has 'await' but is declared synchronously: '${fnHeader}'`);
    }
}
