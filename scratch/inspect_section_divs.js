const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const sectionDivs = html.match(/id="section-[^"]+"/g) || [];
console.log('Section divs found:', sectionDivs.length);
sectionDivs.forEach(s => console.log(' ', s));
