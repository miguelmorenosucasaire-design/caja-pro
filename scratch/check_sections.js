const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

// Find all section-* ids
const sectionRegex = /id="(section-[^"]+)"[^>]*class="([^"]*)"/g;
let match;
console.log('--- SECTIONS FOUND ---');
while ((match = sectionRegex.exec(html)) !== null) {
    console.log(`ID: ${match[1]} | Classes: ${match[2]}`);
}
