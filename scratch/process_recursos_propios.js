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

// Career mapping helper
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
    return prog;
}

// Concepto helper
function mapModuloToConcepto(prog, mod) {
    const p = (prog || '').toUpperCase();
    const m = (mod || '').toUpperCase();
    if (p.includes('TITULACION') || m.includes('TITULO')) return 'Titulación';
    if (m.includes('MODULO')) return m.replace(/\s+/g, ' ');
    return 'Matrícula';
}

// Format Name helper: "Yana Panca, Pedro Luis " -> "Pedro Luis Yana Panca"
function formatStudentName(rawName) {
    if (!rawName) return '';
    let n = rawName.trim();
    if (n === 'ANULADO' || n === 'NO EXISTE BOLETA') return n;

    if (n.includes(',')) {
        const parts = n.split(',');
        const apellidos = parts[0].trim();
        const nombres = parts.slice(1).join(' ').trim();
        return `${nombres} ${apellidos}`.replace(/\s+/g, ' ');
    }
    return n.replace(/\s+/g, ' ');
}

// Clean date helper: 2026-01-19, 27/02//2026 -> 2026-02-27
function cleanDate(d) {
    if (!d) return null;
    let s = d.trim().replace(/\/\//g, '/');
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
    }
    return s;
}

const records = [];
let headerFound = false;

for (const l of lines) {
    if (l.includes('N° RECIBO')) {
        headerFound = true;
        continue;
    }
    if (!headerFound) continue;
    const p = parseCSVLine(l);
    if (!p[0]) continue;
    const num = parseInt(p[0], 10);
    if (isNaN(num)) continue;

    const rawFecha = p[1];
    const rawNombre = p[2];
    const rawProg = p[3];
    const rawMonto = p[4];
    const rawMod = p[5];
    const rawTurno = p[6];
    const rawDni = p[7];
    const rawCel = p[8];
    const rawObserv = p[9];

    const isAnulado = rawNombre === 'ANULADO' || rawNombre === 'NO EXISTE BOLETA' || (rawObserv && rawObserv.includes('ANULADO')) || (rawProg && rawProg.includes('ANULADO'));
    const monto = isAnulado ? 0 : (parseFloat(rawMonto) || 0);

    records.push({
        reciboNum: num,
        comprobante: String(num).padStart(7, '0'),
        rawFecha,
        fecha: cleanDate(rawFecha) || '2026-01-01',
        rawNombre,
        nombreFormateado: formatStudentName(rawNombre),
        rawProg,
        carrera: isAnulado ? 'Sin Asignar (Pendiente)' : mapProgramaToCarrera(rawProg),
        monto,
        rawMod,
        concepto: mapModuloToConcepto(rawProg, rawMod),
        turno: rawTurno || 'Mañana',
        dni: (rawDni || '').trim(),
        telefono: (rawCel || '').trim(),
        observ: (rawObserv || '').trim(),
        isAnulado
    });
}

console.log('Total records:', records.length);
console.log('Total valid amount:', records.reduce((acc, r) => acc + r.monto, 0));

// Count students
const studentMap = new Map();
records.filter(r => !r.isAnulado && r.nombreFormateado).forEach(r => {
    const key = r.nombreFormateado.toLowerCase();
    if (!studentMap.has(key)) {
        studentMap.set(key, {
            nombre: r.nombreFormateado,
            carrera: r.carrera,
            dni: r.dni,
            telefono: r.telefono,
            turno: r.turno,
            totalPagado: 0,
            pagosCount: 0
        });
    }
    const st = studentMap.get(key);
    st.totalPagado += r.monto;
    st.pagosCount += 1;
    if (!st.dni && r.dni) st.dni = r.dni;
    if (!st.telefono && r.telefono) st.telefono = r.telefono;
    if (r.carrera && r.carrera !== 'Sin Asignar (Pendiente)') st.carrera = r.carrera;
});

console.log('Total unique students extracted:', studentMap.size);

// Carreras summary of students
const carreraCount = {};
for (const st of studentMap.values()) {
    carreraCount[st.carrera] = (carreraCount[st.carrera] || 0) + 1;
}
console.log('Students by Carrera:', carreraCount);
