const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const matches = [...content.matchAll(/class="[^"]*print-header-institucional[^"]*"[\s\S]{1,500}<\/div>/g)];
console.log('Found print headers:', matches.length);
matches.forEach((m, idx) => {
    console.log(`Print header #${idx+1}:\n`, m[0].slice(0, 300));
});
