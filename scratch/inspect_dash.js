const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('id="section-dashboard"');
if (idx !== -1) {
    console.log(html.substring(idx, idx + 1500));
}
