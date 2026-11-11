const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const content = fs.readFileSync('scratch/user_provided_recursos_propios.csv', 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

function parseCSVLine(line) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQuotes && line[i+1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            res.push(cur.trim());
            cur = '';
        } else {
            cur += c;
        }
    }
    res.push(cur.trim());
    return res;
}

const csvMap = new Map();
let headerFound = false;

for (const l of lines) {
    if (l.includes('N° RECIBO')) {
        headerFound = true;
        continue;
    }
    if (!headerFound) continue;
    const parts = parseCSVLine(l);
    if (!parts[0]) continue;
    const reciboNum = parseInt(parts[0], 10);
    if (isNaN(reciboNum)) continue;

    csvMap.set(reciboNum, {
        recibo: parts[0],
        fecha: parts[1],
        nombre: parts[2],
        programa: parts[3],
        monto: parseFloat(parts[4]) || 0,
        modulo: parts[5],
        turno: parts[6],
        dni: parts[7],
        cel: parts[8],
        observ: parts[9]
    });
}

console.log('Total receipts in CSV map:', csvMap.size);

const dbMovs = db.prepare('SELECT * FROM movimientos').all();
console.log('Total db movs:', dbMovs.length);

const dbReceiptNums = new Set();
for (const m of dbMovs) {
    const num = parseInt(m.comprobante.replace(/^0+/, ''), 10);
    dbReceiptNums.add(num);
}

// Compare
for (let r = 601; r <= 807; r++) {
    const inCsv = csvMap.get(r);
    const inDb = dbReceiptNums.has(r);
    if (!inDb) {
        console.log(`Receipt ${r} missing in DB: CSV data =`, inCsv);
    }
}
