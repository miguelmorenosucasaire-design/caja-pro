const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
const sec = lines.slice(2934, 3557).join('\n');

const regex = /<button[^>]*>([\s\S]*?)<\/button>/gi;
let match;
const buttons = [];
while ((match = regex.exec(sec)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
    buttons.push(text);
}
console.log('Total botones en section-factura:', buttons.length);
buttons.forEach((b, i) => console.log(`${i+1}: ${b}`));
