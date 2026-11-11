const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const sectionRegex = /<div\s+id="(section-[^"]+)"/g;
const matches = [...html.matchAll(sectionRegex)];

console.log(`Encontradas ${matches.length} secciones.`);

for (let i = 0; i < matches.length; i++) {
    const currentName = matches[i][1];
    const startIndex = matches[i].index;
    const nextIndex = (i + 1 < matches.length) ? matches[i + 1].index : html.indexOf('</main>');

    const sectionHtml = html.substring(startIndex, nextIndex);
    const opens = (sectionHtml.match(/<div(?:\s[^>]*)?>/gi) || []).length;
    const closes = (sectionHtml.match(/<\/div>/gi) || []).length;
    const diff = opens - closes;

    console.log(`- ${currentName.padEnd(25)}: opens=${opens}, closes=${closes}, diff=${diff}`);
}
