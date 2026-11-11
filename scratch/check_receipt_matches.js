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

let header = false;
let diffs = 0;
let exactMatches = 0;

for (const l of lines) {
    if (l.includes('N° RECIBO')) { header = true; continue; }
    if (!header) continue;
    const p = parseCSVLine(l);
    if (!p[0]) continue;
    const num = parseInt(p[0], 10);
    if (isNaN(num)) continue;
    const comp = String(num).padStart(7, '0');

    const rawProg = p[3];
    const rawMonto = parseFloat(p[4]) || 0;
    const rawNombre = p[2];

    const dbRow = db.prepare('SELECT * FROM movimientos WHERE comprobante = ?').get(comp);
    if (!dbRow) {
        console.log(`Receipt ${comp} (${rawNombre}) NOT in DB movimientos!`);
        diffs++;
    } else {
        // Compare monto
        if (dbRow.monto !== rawMonto) {
            console.log(`Monto mismatch for ${comp}: DB=${dbRow.monto}, CSV=${rawMonto} (Name: ${rawNombre})`);
            diffs++;
        } else {
            exactMatches++;
        }
    }
}

console.log(`Summary: ${exactMatches} exact receipt matches in DB, ${diffs} differences/missing.`);
