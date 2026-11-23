const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const start = html.indexOf('id="section-factura"');
const end = html.indexOf('id="section-respaldos"');
const sec = html.substring(start, end);

const regex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
let match;
const buttons = [];
while ((match = regex.exec(sec)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
    if (text) buttons.push(text);
}
console.log('Total botones en section-factura:', buttons.length);
console.log(buttons);
