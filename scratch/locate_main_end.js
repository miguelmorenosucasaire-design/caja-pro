const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const mainEnd = content.indexOf('</main>');
console.log('Position of </main>:', mainEnd);
if (mainEnd !== -1) {
    console.log(content.slice(mainEnd - 1500, mainEnd + 200));
}
