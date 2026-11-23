const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const regex = /class=["']([^"']*)["']/g;
let match;
const darkClasses = new Map();
while ((match = regex.exec(html)) !== null) {
  const classes = match[1].split(/\s+/);
  for (const c of classes) {
    if (c.match(/^text-(slate|gray|zinc|neutral|stone|indigo|blue|sky|emerald|green|rose|red|amber|yellow|cyan|teal|purple|violet)-(600|700|800|900)$/)) {
      darkClasses.set(c, (darkClasses.get(c) || 0) + 1);
    }
  }
}

// Also check within JS backticks
const jsMatches = html.match(/`[^`]*`/g) || [];
for (const tmpl of jsMatches) {
  const cMatches = tmpl.match(/class=["']([^"']*)["']/g) || [];
  for (const cm of cMatches) {
    const raw = cm.replace(/class=["']/, '').replace(/["']$/, '');
    for (const c of raw.split(/\s+/)) {
      if (c.match(/^text-(slate|gray|zinc|neutral|stone|indigo|blue|sky|emerald|green|rose|red|amber|yellow|cyan|teal|purple|violet)-(600|700|800|900)$/)) {
        darkClasses.set(c, (darkClasses.get(c) || 0) + 1);
      }
    }
  }
}

console.log('Total unique dark text classes:', darkClasses.size);
for (const [cls, count] of Array.from(darkClasses.entries()).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${cls}: ${count}`);
}
