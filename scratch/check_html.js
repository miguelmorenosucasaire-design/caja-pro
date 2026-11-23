const fs = require('fs');
const html = fs.readFileSync('templates/index.html', 'utf8');
console.log('Has select form-concepto:', html.includes('<select id="form-concepto"'));
console.log('Has input hidden form-concepto:', html.includes('<input type="hidden" id="form-concepto"'));
console.log('Has Agregar Concepto:', html.includes('Agregar Concepto'));
