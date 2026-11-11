const fs = require('fs');

const html = fs.readFileSync('templates/index.html', 'utf8');
const lines = html.split('\n');

console.log('Total lines in templates/index.html:', lines.length);

lines.forEach((line, idx) => {
    if (line.includes('section-factura') || line.includes('imprimir') || line.includes('recibo') || line.includes('voucher') || line.includes('boleta')) {
        console.log(`Line ${idx + 1}: ${line.trim().substring(0, 100)}`);
    }
});
