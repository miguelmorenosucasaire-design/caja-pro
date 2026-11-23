const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes("navegarA('factura')") || l.includes("navegar('factura')") || l.includes("cambiarSeccion('factura')") || l.includes("activarSeccion('factura')") || l.includes("section-factura")) {
    console.log((i+1) + ': ' + l);
  }
});
