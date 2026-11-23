const fs = require('fs');
const js = fs.readFileSync('public/html2pdf.bundle.min.js', 'utf8');

console.log('Size:', js.length);
// Look for default html2canvas options in html2pdf
const idx = js.indexOf('html2canvas');
console.log('Found html2canvas at:', idx);
const match = js.match(/html2canvas:\s*\{[^}]*\}/g);
console.log('Matches:', match);
