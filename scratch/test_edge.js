const { execSync } = require('child_process');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

try {
  const html = execSync(`"${edge}" --headless --disable-gpu --virtual-time-budget=5000 --dump-dom http://127.0.0.1:5000/public/test_html2pdf.html`, { timeout: 10000 });
  const str = html.toString('utf-8');
  const match = str.match(/<div id="result">(.*?)<\/div>/);
  console.log('Result div:', match ? match[1] : 'not found');
} catch (e) {
  console.log('Error:', e.message);
}
