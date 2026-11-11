const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const scripts = [...html.matchAll(/<script[\s\S]*?<\/script>/g)];
console.log('Total script tags:', scripts.length);
scripts.forEach((s, idx) => {
    console.log(`\nScript ${idx}:`, s[0].substring(0, 300) + '...');
});
