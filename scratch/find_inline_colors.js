const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const inlineStyles = html.match(/style="[^"]*color:[^"]*"/gi) || [];
console.log('Inline style="...color:..." count:', inlineStyles.length);
inlineStyles.slice(0, 20).forEach(s => console.log(' ', s));
