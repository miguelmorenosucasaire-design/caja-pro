const fs = require('fs');
const lines = fs.readFileSync('templates/index.html', 'utf8').split('\n');
lines.forEach((l, idx) => {
    if (l.includes('id="section-factura"') || l.includes('id="section-respaldos"') || l.includes('tab-vista-voucher')) {
        console.log(idx + 1, l.trim().substring(0, 80));
    }
});
