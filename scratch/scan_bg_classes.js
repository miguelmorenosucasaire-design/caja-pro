const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /class=["']([^"']*)["']/g;
let match;
const bgClasses = new Map();
while ((match = regex.exec(html)) !== null) {
  const classes = match[1].split(/\s+/);
  for (const c of classes) {
    if (c.match(/^bg-(slate|gray|zinc|neutral|stone|indigo|blue|sky|emerald|green|rose|red|amber|yellow|cyan|teal|purple|violet)-(50|100|200)/)) {
      bgClasses.set(c, (bgClasses.get(c) || 0) + 1);
    }
  }
}
console.log('Light background classes found:');
for (const [cls, count] of Array.from(bgClasses.entries()).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${cls}: ${count}`);
}
