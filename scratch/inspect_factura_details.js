const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const facIdx = content.indexOf('id="section-factura"');
const endFac = content.indexOf('</section>', facIdx) !== -1 ? content.indexOf('</section>', facIdx) : content.indexOf('<!-- ==========================================', facIdx + 10);
console.log('Factura HTML length:', endFac - facIdx);
console.log(content.slice(facIdx, facIdx + 4500));

const selIdx = content.indexOf('function seleccionarFacturaRecibo(');
if (selIdx !== -1) {
    console.log('seleccionarFacturaRecibo JS:\n', content.slice(selIdx, selIdx + 2000));
}
