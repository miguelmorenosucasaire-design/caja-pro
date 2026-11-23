const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const matches = [233897, 241094, 351090, 364210];

matches.forEach((idx, i) => {
  console.log(`=== MATCH ${i + 1} at ${idx} ===`);
  console.log(html.substring(idx - 60, idx + 450));
});
