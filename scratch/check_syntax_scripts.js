const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const vm = require('vm');
// Extract scripts
const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let m;
let count = 0;
while ((m = scriptRegex.exec(html)) !== null) {
  count++;
  try {
    new vm.Script(m[1]);
    console.log(`Script ${count}: Syntax OK`);
  } catch (err) {
    console.error(`Script ${count}: SYNTAX ERROR!`, err.message);
  }
}
