const fs = require('fs');
const content = fs.readFileSync('scratch/user_provided_recursos_propios.csv', 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

console.log('Total non-empty lines:', lines.length);

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

let headers = null;
const records = [];
let totalMontoValido = 0;
let totalMontoGeneral = 0;
const programas = new Set();
const turnos = new Set();
const modulos = new Set();

for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('N° RECIBO')) {
        headers = parseCSVLine(l);
        continue;
    }
    if (!headers) continue;
    const parts = parseCSVLine(l);
    if (parts.length < 5) continue;
    const recibo = parts[0];
    const fecha = parts[1];
    const nombre = parts[2];
    const programa = parts[3];
    const montoStr = parts[4];
    const modulo = parts[5] || '';
    const turno = parts[6] || '';
    const dni = parts[7] || '';
    const cel = parts[8] || '';
    const observ = parts[9] || '';

    const monto = parseFloat(montoStr) || 0;
    totalMontoGeneral += monto;

    const isAnulado = nombre === 'ANULADO' || nombre === 'NO EXISTE BOLETA' || observ.includes('ANULADO') || programa.includes('ANULADO');
    if (!isAnulado) {
        totalMontoValido += monto;
    }

    if (programa) programas.add(programa);
    if (turno) turnos.add(turno);
    if (modulo) modulos.add(modulo);

    records.push({ recibo, fecha, nombre, programa, monto, modulo, turno, dni, cel, observ, isAnulado });
}

console.log('Total records parsed:', records.length);
console.log('Total monto valido:', totalMontoValido);
console.log('Total monto general:', totalMontoGeneral);
console.log('Distinct programas:', Array.from(programas));
console.log('Distinct turnos:', Array.from(turnos));
console.log('Distinct modulos:', Array.from(modulos));

// Check anulados
const anulados = records.filter(r => r.isAnulado);
console.log('Anulados count:', anulados.length, anulados.map(a => `${a.recibo}: ${a.nombre || a.observ}`));

// Check distinct students (by name)
const validRecords = records.filter(r => !r.isAnulado && r.nombre);
const uniqueStudents = new Set();
validRecords.forEach(r => uniqueStudents.add(r.nombre.toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ').trim()));
console.log('Unique student names count:', uniqueStudents.size);
