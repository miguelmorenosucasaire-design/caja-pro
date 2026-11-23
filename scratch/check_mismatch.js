const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');

const bodyStart = html.indexOf('<body');
const bodyHtml = html.substring(bodyStart);

const lines = bodyHtml.split('\n');

console.log('Line 2696 of body:');
for (let i = 2690; i <= 2705; i++) {
    console.log(`${i}: ${lines[i]}`);
}

console.log('\nAround line 3030 of body:');
for (let i = 3025; i <= 3035; i++) {
    console.log(`${i}: ${lines[i]}`);
}
