const fs = require('fs');

let html = fs.readFileSync('templates/index.html', 'utf8');

const target = 'sincronizarNotaConVoucher(notaTexto);';
const replacement = 'sincronizarNotaConVoucher(notaTexto);\n            sincronizarCopiaVoucher();';

if (html.includes(target) && !html.includes('sincronizarCopiaVoucher();')) {
    html = html.replace(target, replacement);
    fs.writeFileSync('templates/index.html', html, 'utf8');
    console.log('sincronizarCopiaVoucher() call successfully injected!');
} else {
    console.log('Already present or target not found');
}
