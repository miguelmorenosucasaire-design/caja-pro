const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('function renderGrupos');
const snippet = html.substring(idx, idx + 4500);
const btnMatches = snippet.match(/<button [^>]*>[^<]*<\/button>/g);
console.log('Buttons inside renderGrupos:', btnMatches);

const actionsIdx = snippet.indexOf('<!-- Botones de Acción -->');
if (actionsIdx > -1) {
    console.log('Action block:\n', snippet.substring(actionsIdx, actionsIdx + 1200));
}
