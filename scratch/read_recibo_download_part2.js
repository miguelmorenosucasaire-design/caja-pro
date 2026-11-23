const fs = require('fs');
const content = fs.readFileSync('C:/Users/MIGUEL/Downloads/recibo-ingreso.html', 'utf8');
const lines = content.split('\n');
for (let i = 120; i < lines.length; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
