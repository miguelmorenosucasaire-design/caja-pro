const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const json = JSON.parse(fs.readFileSync('scratch/real_data/19-NOV-2026_INGRESO_RECURSOS_PROPIOS.json', 'utf8'));
const db = new DatabaseSync('caja_institucional.db');

function convertirNombre(raw) {
    if (!raw) return '';
    const r = raw.trim();
    if (r === 'ANULADO' || r === 'NO EXISTE BOLETA') return r;
    if (r.includes(',')) {
        const parts = r.split(',');
        const apellidos = parts[0].trim();
        const nombres = parts.slice(1).join(' ').trim();
        // Capitalize properly
        const cap = s => s.split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');
        return `${cap(nombres)} ${cap(apellidos)}`;
    }
    return r;
}

function normalizar(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
}

const dbEsts = db.prepare('SELECT * FROM estudiantes').all();
console.log('Current db students:', dbEsts.length);

const estMap = new Map();
dbEsts.forEach(e => {
    estMap.set(normalizar(e.nombre), e);
    if (e.dni && e.dni.trim() !== '') estMap.set('dni_' + e.dni.trim(), e);
});

let newStudents = [];
json.forEach(j => {
    if (!j.apellidos_nombres || j.apellidos_nombres === 'ANULADO' || j.apellidos_nombres === 'NO EXISTE BOLETA') return;
    const normName = normalizar(j.apellidos_nombres);
    const converted = convertirNombre(j.apellidos_nombres);
    const normConv = normalizar(converted);
    const dniKey = j.dni ? 'dni_' + String(j.dni).trim() : null;

    let existing = estMap.get(normName) || estMap.get(normConv);
    if (!existing && dniKey) existing = estMap.get(dniKey);

    if (!existing) {
        if (!newStudents.find(ns => normalizar(ns.nombre) === normConv)) {
            newStudents.push({
                nombre: converted,
                raw: j.apellidos_nombres,
                dni: j.dni ? String(j.dni).trim() : '',
                telefono: j.celular ? String(j.celular).trim() : '',
                carrera: j.programa_estudio || 'Sin Asignar (Pendiente)',
                turno: j.turno || 'Turno Tarde'
            });
        }
    }
});

console.log('New students to insert:', newStudents.length);
newStudents.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.nombre} (${s.dni || 'Sin DNI'} | ${s.telefono || 'Sin Cel'} | ${s.carrera})`);
});

db.close();
