const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const lines = html.split('\n');

console.log('--- Search section-diario & bitacora ---');
lines.forEach((l, idx) => {
  if (l.includes('section-diario') || l.includes('bitacora') || l.includes('calendarizacion') || l.includes('diario-')) {
    console.log(`${idx + 1}: ${l.trim().slice(0, 100)}`);
  }
});
