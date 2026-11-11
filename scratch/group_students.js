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

function normalizeName(raw) {
    if (!raw) return '';
    let s = raw.trim();
    if (s.includes(',')) {
        const p = s.split(',');
        s = `${p.slice(1).join(' ').trim()} ${p[0].trim()}`;
    }
    return s.replace(/\s+/g, ' ').trim();
}

function normalizeKey(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
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
const students = new Map(); // key -> student object

for (const l of lines) {
    if (l.includes('N° RECIBO')) { header = true; continue; }
    if (!header) continue;
    const p = parseCSVLine(l);
    if (!p[0]) continue;
    const recibo = parseInt(p[0], 10);
    if (isNaN(recibo)) continue;

    const nombre = p[2];
    const prog = p[3];
    const monto = parseFloat(p[4]) || 0;
    const modulo = p[5];
    const turno = p[6];
    const dni = (p[7] || '').trim();
    const cel = (p[8] || '').trim();
    const obs = (p[9] || '').trim();

    if (nombre === 'ANULADO' || nombre === 'NO EXISTE BOLETA') continue;
    if (obs.includes('ANULADO') && monto === 0) continue;

    const fullName = normalizeName(nombre);
    if (!fullName) continue;

    // Use DNI as key if present, otherwise normalized name
    let key = dni ? `DNI_${dni}` : `NAME_${normalizeKey(fullName)}`;

    // Special check: did we already have this student by name?
    const nameKey = `NAME_${normalizeKey(fullName)}`;
    if (dni && !students.has(key) && students.has(nameKey)) {
        key = nameKey;
    }

    if (!students.has(key)) {
        students.set(key, {
            nombre: fullName,
            carrera: mapProgramaToCarrera(prog),
            dni: dni,
            telefono: cel,
            turno: turno || 'Mañana',
            totalPagos: 0,
            pagosCount: 0,
            recibos: []
        });
    }

    const st = students.get(key);
    st.totalPagos += monto;
    st.pagosCount++;
    st.recibos.push(recibo);
    if (!st.dni && dni) st.dni = dni;
    if (!st.telefono && cel) st.telefono = cel;
    if (turno && (!st.turno || st.turno === 'Mañana')) st.turno = turno;
    if (prog && st.carrera === 'Sin Asignar (Pendiente)') {
        st.carrera = mapProgramaToCarrera(prog);
    }
}

console.log('Total students grouped:', students.size);
const byCarrera = {};
for (const st of students.values()) {
    byCarrera[st.carrera] = (byCarrera[st.carrera] || 0) + 1;
}
console.log('Students by Carrera:', byCarrera);
