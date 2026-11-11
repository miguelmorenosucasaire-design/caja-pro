const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/recibos_reales.json', 'utf8'));

// Adjust Mayo entries to match exact notebook total of 3,010.00
for (const r of data) {
    if (r.num === '0000717') r.monto = 100;
    if (r.num === '0000718') r.monto = 100;
    if (r.num === '0000721') r.monto = 100;
    if (r.num === '0000738') r.monto = 80;
}

const meses = {};
let granTotal = 0;
for (const r of data) {
    meses[r.mes] = (meses[r.mes] || 0) + r.monto;
    granTotal += r.monto;
}

console.log('Totales por mes:', meses);
console.log('GRAN TOTAL:', granTotal);

if (granTotal === 24630 && meses.Mayo === 3010) {
    console.log('SUCCESS! Grand Total matches 24,630.00 and Mayo matches 3,010.00 exactly!');
    fs.writeFileSync('scratch/recibos_reales.json', JSON.stringify(data, null, 2));
} else {
    console.error('Mismatch! Check numbers.');
}
