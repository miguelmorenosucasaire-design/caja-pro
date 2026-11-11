const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const lastDivModal = html.lastIndexOf('</div>\n    </div>');
const scriptIdx = html.indexOf('<script>', 280000);

console.log('lastDivModal:', lastDivModal);
console.log('scriptIdx:', scriptIdx);
if (scriptIdx !== -1) {
    console.log(html.substring(scriptIdx - 100, scriptIdx + 100));
}
