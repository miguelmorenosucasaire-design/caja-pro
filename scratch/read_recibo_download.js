const fs = require('fs');
const content = fs.readFileSync('C:/Users/MIGUEL/Downloads/recibo-ingreso.html', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
for (let i = 0; i < Math.min(lines.length, 120); i++) {
  console.log(`${i+1}: ${lines[i].substring(0, 100)}`);
}
