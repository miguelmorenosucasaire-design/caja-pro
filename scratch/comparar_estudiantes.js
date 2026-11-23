const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const json = JSON.parse(fs.readFileSync('scratch/real_data/19-NOV-2026_INGRESO_RECURSOS_PROPIOS.json', 'utf8'));
const db = new DatabaseSync('caja_institucional.db');

const dbEsts = db.prepare('SELECT id, nombre, dni, carrera, grupo FROM estudiantes').all();
console.log('Total estudiantes en DB:', dbEsts.length);

function convertirNombre(raw) {
    if (!raw) return '';
    const r = raw.trim();
    if (r === 'ANULADO' || r === 'NO EXISTE BOLETA') return r;
    if (r.includes(',')) {
        const parts = r.split(',');
        const apellidos = parts[0].trim();
        const nombres = parts.slice(1).join(' ').trim();
        return `${nombres} ${apellidos}`;
    }
    return r;
}

function cleanText(t) {
    return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

const dbEstMapByName = new Map();
dbEsts.forEach(e => {
    dbEstMapByName.set(cleanText(e.nombre), e);
});

let matched = 0;
let unmatched = [];

json.forEach(j => {
    const rawNom = j.apellidos_nombres;
    if (!rawNom || rawNom === 'ANULADO' || rawNom === 'NO EXISTE BOLETA') return;
    const convNom = convertirNombre(rawNom);
    const c1 = cleanText(rawNom);
    const c2 = cleanText(convNom);

    if (dbEstMapByName.has(c1) || dbEstMapByName.has(c2)) {
        matched++;
    } else {
        if (!unmatched.find(u => cleanText(u.raw) === c1)) {
            unmatched.push({ raw: rawNom, converted: convNom, dni: j.dni, prog: j.programa_estudio, recibo: j.numero_recibo });
        }
    }
});

console.log('Total matched student payments with existing students:', matched);
console.log('Total new unmatched student names:', unmatched.length);
console.log('\nNuevos estudiantes que se agregarán al padrón oficial:');
unmatched.forEach((u, i) => {
    console.log(`${i+1}. ${u.converted} (DNI: ${u.dni || 'Sin DNI'} | Carrera: ${u.prog} | Recibo: ${u.recibo})`);
});

db.close();
