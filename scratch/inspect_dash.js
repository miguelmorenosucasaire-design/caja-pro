const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const dashStart = html.indexOf('id="section-dashboard"');
console.log('Dashboard snippet:\n', html.substring(dashStart, dashStart + 3000));
