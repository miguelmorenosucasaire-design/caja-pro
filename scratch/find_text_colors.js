const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all text color classes
const textClasses = html.match(/text-(slate|gray|zinc|neutral|emerald|amber|rose|sky|indigo|cyan|blue|violet)-[0-9]+/g) || [];
const counts = {};
textClasses.forEach(c => counts[c] = (counts[c] || 0) + 1);

// Sort by frequency
const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
console.log('Most common text color classes:');
sorted.slice(0, 30).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
