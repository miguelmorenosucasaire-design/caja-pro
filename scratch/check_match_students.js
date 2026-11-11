const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const currentEsts = db.prepare('SELECT id, codigo, nombre, carrera FROM estudiantes').all();
console.log('Current DB estudiantes count:', currentEsts.length);

// Read CSV
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

function normalize(s) {
    if (!s) return '';
    return s.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const csvStudents = new Map();
let header = false;
for (const l of lines) {
    if (l.includes('N° RECIBO')) { header = true; continue; }
    if (!header) continue;
    const p = parseCSVLine(l);
    if (!p[0]) continue;
    const rawNombre = p[2];
    const rawProg = p[3];
    const rawDni = p[7];
    const rawCel = p[8];
    const rawTurno = p[6];

    if (!rawNombre || rawNombre === 'ANULADO' || rawNombre === 'NO EXISTE BOLETA') continue;
    
    // Normalize format
    let formatted = rawNombre;
    if (rawNombre.includes(',')) {
        const parts = rawNombre.split(',');
        formatted = `${parts.slice(1).join(' ').trim()} ${parts[0].trim()}`;
    }

    const normKey = normalize(formatted);
    if (!csvStudents.has(normKey)) {
        csvStudents.set(normKey, {
            rawNombre,
            formatted,
            prog: rawProg,
            dni: rawDni,
            cel: rawCel,
            turno: rawTurno
        });
    }
}

console.log('Unique students in CSV:', csvStudents.size);

let matched = 0;
let unmatched = [];

for (const est of currentEsts) {
    const n = normalize(est.nombre);
    let found = csvStudents.get(n);
    if (!found) {
        // try finding substring
        for (const [k, v] of csvStudents.entries()) {
            if (k.includes(n) || n.includes(k)) {
                found = v;
                break;
            }
        }
    }

    if (found) {
        matched++;
    } else {
        unmatched.push(est.nombre);
    }
}

console.log(`Matched ${matched} / ${currentEsts.length} students in current DB.`);
if (unmatched.length > 0) {
    console.log('Sample unmatched in DB (first 10):', unmatched.slice(0, 10));
}
