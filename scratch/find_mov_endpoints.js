const fs = require('fs');
const s = fs.readFileSync('server.js', 'utf8');

const lines = s.split('\n');
lines.forEach((l, i) => {
  if (l.includes('/movimientos') || l.includes('movimientos')) {
    if (l.includes('app.') || l.includes('router.')) {
      console.log(`L${i+1}: ${l.trim()}`);
    }
  }
});
