const fs = require('fs');
const content = fs.readFileSync('C:/Users/MIGUEL/Downloads/recibo-ingreso.html', 'utf8');
const match = content.match(/const ESCUDO = "data:image\/png;base64,([^"]+)";/);
if (match) {
  const buf = Buffer.from(match[1], 'base64');
  fs.writeFileSync('scratch/escudo_from_download.png', buf);
  console.log('Saved scratch/escudo_from_download.png, size:', buf.length);
} else {
  console.log('No match for ESCUDO');
}
