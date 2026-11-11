const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /id="(section-[^"]+)"/g;
let m;
const sections = [];
while ((m = regex.exec(html)) !== null) {
    sections.push(m[1]);
}
console.log('Sections found in index.html:', sections);
