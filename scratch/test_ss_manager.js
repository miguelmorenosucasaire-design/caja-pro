const fs = require('fs');
const path = require('path');

const xlDir = path.join(__dirname, 'excel_unpacked', 'xl');
const ssXml = fs.readFileSync(path.join(xlDir, 'sharedStrings.xml'), 'utf8');

// Parse shared strings
const strings = [];
const siRegex = /<si>([\s\S]*?)<\/si>/g;
let match;
while ((match = siRegex.exec(ssXml)) !== null) {
    const siContent = match[1];
    const tMatches = [...siContent.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)];
    strings.push(tMatches.map(m => m[1]).join(''));
}

console.log('Original strings count:', strings.length);
console.log('First 5 strings:', strings.slice(0, 5));
console.log('Last 5 strings:', strings.slice(-5));
