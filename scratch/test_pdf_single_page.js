const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetHtml = path.resolve('scratch/test_print_page.html');
const outPdf = path.resolve('scratch/test_output_1page.pdf');

try {
  execSync(`& "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --print-to-pdf="${outPdf}" "${targetHtml}"`, { shell: 'powershell' });
  const pdfBytes = fs.readFileSync(outPdf);
  const countMatches = (pdfBytes.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
  console.log('Total pages in printed PDF:', countMatches);
} catch (e) {
  console.error('Error generating PDF:', e.message);
}
