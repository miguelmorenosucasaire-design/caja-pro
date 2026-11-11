const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
let idx = 0;
while((idx = html.indexOf('@media print', idx)) !== -1) {
    console.log('Match at', idx);
    console.log(html.substring(idx, idx + 600));
    console.log('--------------------------');
    idx += 20;
}
