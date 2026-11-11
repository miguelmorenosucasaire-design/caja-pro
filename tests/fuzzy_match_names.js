const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const normalize = (str) => {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/\s+/g, '') // remove spaces
        .trim();
};

const estudiantes = db.prepare("SELECT id, codigo, nombre FROM estudiantes").all();
const estMap = new Map();
estudiantes.forEach(e => {
    estMap.set(normalize(e.nombre), e);
});

const movs = db.prepare("SELECT id, comprobante, nombre, monto FROM movimientos WHERE rol = 'Estudiante'").all();

console.log('--- REVISANDO DISCREPANCIAS DE NOMBRES EN MOVIMIENTOS ---');
let fixedCount = 0;
movs.forEach(m => {
    const rawNom = m.nombre.trim();
    if (['ANULADO', 'NO EXISTE BOLETA', 'Deysi Jenifer Apaza Callasaca'].includes(rawNom)) return;
    
    // Check direct match
    const directMatch = estudiantes.find(e => e.nombre.toLowerCase().trim() === rawNom.toLowerCase());
    if (!directMatch) {
        // Try normalized match (ignoring accents and spaces)
        const normKey = normalize(rawNom);
        const normMatch = estMap.get(normKey);
        if (normMatch) {
            console.log(`Discrepancia detectada en Mov #${m.id} (Comprobante ${m.comprobante}):`);
            console.log(`   Movimiento: "${m.nombre}" -> Estudiante real: "${normMatch.nombre}" (Código: ${normMatch.codigo})`);
            fixedCount++;
        } else {
            console.log(`Mov #${m.id} (${m.comprobante}): "${m.nombre}" NO TIENE COINCIDENCIA.`);
        }
    }
});

console.log(`Total discrepancias detectadas: ${fixedCount}`);
