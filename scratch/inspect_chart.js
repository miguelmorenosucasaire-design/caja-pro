const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('new Chart(');
if (idx !== -1) {
    console.log(html.substring(idx - 200, idx + 800));
}
