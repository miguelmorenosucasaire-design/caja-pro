const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'templates', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

html = html.replace('147 estudiantes matriculados', '176 estudiantes matriculados');
html = html.replace('los 147 estudiantes', 'los 176 estudiantes');
html = html.replace('Nómina oficial de 147 estudiantes', 'Nómina oficial de 176 estudiantes');
html = html.replace('Balance al día (S/. 24,630.00)', 'Balance al día (S/. 25,080.00)');

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ Updated templates/index.html with 176 students and S/. 25,080.00 balance!');
