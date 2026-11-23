const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regexLogo = /<img[^>]+(minedu|logo)[^>]+>/gi;
let match;
while ((match = regexLogo.exec(html)) !== null) {
  console.log('Found logo img in HTML:', match[0]);
}

const files = fs.readdirSync('public/img');
console.log('Files in public/img:', files.filter(f => f.includes('minedu') || f.includes('logo') || f.includes('cetpro')));
