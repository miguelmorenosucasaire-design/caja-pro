const fs = require('fs');
const content = fs.readFileSync('templates/index.html', 'utf8');

const facIdx = content.indexOf('id="section-factura"');
const nextIdx = content.indexOf('<!-- ==========================================', facIdx + 10);
const facturaHtml = content.slice(facIdx, nextIdx !== -1 ? nextIdx : content.indexOf('</main>', facIdx));
console.log('Factura HTML:\n', facturaHtml);
