const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');

const idx = html.indexOf('whitespace-nowrap">\n                            <!-- Botón Cambiar');
if (idx !== -1) {
  console.log('Found with newline');
} else {
  const idx2 = html.indexOf('whitespace-nowrap">');
  console.log(html.substring(idx2, idx2 + 200));
}
