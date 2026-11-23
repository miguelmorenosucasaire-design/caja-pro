const fs = require('fs');
const js = fs.readFileSync('public/html2pdf.bundle.min.js', 'utf8');

const idx = js.indexOf('.toContainer=function()');
if (idx !== -1) {
  console.log(js.substring(idx - 200, idx + 800));
} else {
  const idx2 = js.indexOf('toContainer');
  console.log('toContainer at:', idx2);
  console.log(js.substring(idx2 - 100, idx2 + 1000));
}
