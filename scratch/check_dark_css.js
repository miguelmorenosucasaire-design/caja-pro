const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

// Check CSS selectors in dark mode
const cssMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
if (cssMatch) {
  const css = cssMatch[1];
  const darkRules = css.match(/\.dark[^{]+{[^}]+}/g) || [];
  console.log(`Found ${darkRules.length} .dark CSS rules`);
}
