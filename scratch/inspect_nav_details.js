const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Look for navigation menu HTML
const asideMatch = html.match(/<aside[\s\S]*?<\/aside>/);
console.log('Aside navigation:');
console.log(asideMatch ? asideMatch[0] : 'no aside');

// Look for switchTab or showSection function in Script 3
const script3 = html.split('<script>')[3];
const navFuncMatch = script3.match(/function (switchTab|showSection|showTab|cambiarSeccion|irASeccion)[\s\S]*?\n\s*\}/g);
console.log('\nNavigation functions:');
console.log(navFuncMatch ? navFuncMatch.join('\n\n') : 'no nav functions found');
