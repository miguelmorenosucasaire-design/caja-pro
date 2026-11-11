const fs = require('fs');

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

function cleanStudentName(raw) {
    if (!raw) return '';
    let s = raw.trim();
    if (s === 'ANULADO' || s === 'NO EXISTE BOLETA') return s;

    // Special fixes for obvious typos in raw CSV
    if (s.includes('Hilasaca Colqueh.Yuly Noemi')) return 'Yuly Noemi Hilasaca Colquehuanca';
    if (s.includes('CABRERA L Naleli Lisbeth Cabrera L.')) return 'Nayeli Lisbeth Cabrera Larico';
    if (s.includes('Apaza,Nory Yoselin')) return 'Nory Yoselin Pomari Apaza'; // see receipt 769: Pomari Apaza, Nory Yoselin
    if (s.includes('Rios Quinto Vilca Chino')) return 'Rios Quinto Vilca Chino';

    if (s.includes(',')) {
        const parts = s.split(',');
        const ape = parts[0].trim();
        const nom = parts.slice(1).join(' ').trim();
        return `${nom} ${ape}`.replace(/\s+/g, ' ');
    }
    return s.replace(/\s+/g, ' ');
}

function mapProgramaToCarrera(prog) {
    if (!prog) return 'Sin Asignar (Pendiente)';
    const p = prog.toUpperCase().trim();
    if (p.includes('MOTOS')) return 'Mecánica de Motos';
    if (p.includes('COMPUTACION') || p.includes('INFORMATICA')) return 'Computación e Informática';
    if (p.includes('CORTE') || p.includes('ENSAMBL')) return 'Corte y Ensamblaje';
    if (p.includes('PELUQUERIA') || p.includes('BARBERIA')) return 'Peluquería y Barbería';
    if (p.includes('CARPINTERIA') || p.includes('METALICA')) return 'Carpintería Metálica';
    if (p.includes('AUTOMOTORIZ') || p.includes('AUTOMOTRIZ')) return 'Mecánica Automotriz';
    if (p.includes('ELECTRONICA') || p.includes('ELECTRICIDAD')) return 'Electricidad y Electrónica';
    return 'Sin Asignar (Pendiente)';
}

let header = false;
const parsed = [];

for (const l of lines) {
    if (l.includes('N° RECIBO')) { header = true; continue; }
    if (!header) continue;
    const p = parseCSVLine(l);
    if (!p[0]) continue;
    const recibo = parseInt(p[0], 10);
    if (isNaN(recibo)) continue;

    const fecha = p[1];
    const nombre = p[2];
    const prog = p[3];
    const monto = parseFloat(p[4]) || 0;
    const mod = p[5];
    const turno = p[6];
    const dni = p[7];
    const cel = p[8];
    const obs = p[9];

    const cleanNom = cleanStudentName(nombre);
    const carrera = mapProgramaToCarrera(prog);

    parsed.push({
        recibo,
        comprobante: String(recibo).padStart(7, '0'),
        fecha,
        rawNombre: nombre,
        nombre: cleanNom,
        rawProg: prog,
        carrera,
        monto,
        modulo: mod,
        turno,
        dni,
        cel,
        obs
    });
}

console.log('Total parsed rows:', parsed.length);
console.log('Sample parsed rows 601-610:');
parsed.slice(0, 10).forEach(r => console.log(`  ${r.recibo}: ${r.nombre} | ${r.carrera} | S/. ${r.monto} | DNI: ${r.dni}`));
