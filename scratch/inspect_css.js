const fs = require('fs');

// We have the PDF in scratch/test_output_1page.pdf
// Let's check how the PDF looks or inspect the CSS for .recibo
const html = fs.readFileSync('templates/index.html', 'utf8');
console.log('Checking .recibo styles in CSS:');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('voucher-media-carta') || l.includes('462px') || l.includes('.recibo {')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
