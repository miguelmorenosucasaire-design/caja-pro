const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all document.getElementById('...') in the script
const idMatches = [...html.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)];
const ids = [...new Set(idMatches.map(m => m[1]))];

console.log(`Found ${ids.length} unique getElementById lookups.`);
const missing = [];
for (const id of ids) {
    // Check if id="..." exists in html
    const regex = new RegExp(`id=["']${id}["']`);
    if (!regex.test(html)) {
        missing.push(id);
    }
}

console.log('Missing IDs:', missing);
