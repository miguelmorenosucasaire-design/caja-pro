const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Extract all element IDs in index.html
const idMatches = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const idSet = new Set(idMatches);

console.log(`Total IDs encontrados en index.html: ${idSet.size}`);

// Extract all document.getElementById calls in index.html
const getElMatches = [...html.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const missingIds = new Set();
for (const id of getElMatches) {
    if (!idSet.has(id)) {
        missingIds.add(id);
    }
}

console.log(`document.getElementById llamadas: ${getElMatches.length}`);
console.log(`IDs llamados que NO existen en el HTML (${missingIds.size}):`, [...missingIds]);
