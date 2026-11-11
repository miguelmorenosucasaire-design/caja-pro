const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf-8');

const getIds = [...html.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const tagIds = new Set([...html.matchAll(/\sid=['"]([^'"]+)['"]/g)].map(m => m[1]));

console.log('Total getElementById calls:', getIds.length);
console.log('Total tag IDs found in HTML:', tagIds.size);

const missing = [];
for (const id of getIds) {
    if (!tagIds.has(id)) {
        missing.push(id);
    }
}
console.log('MISSING IDs in HTML:', Array.from(new Set(missing)));
