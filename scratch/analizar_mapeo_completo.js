const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const json = JSON.parse(fs.readFileSync('scratch/real_data/19-NOV-2026_INGRESO_RECURSOS_PROPIOS.json', 'utf8'));
const db = new DatabaseSync('caja_institucional.db');

console.log('=== ANÁLISIS DE MAPEO DE LOS 241 REGISTROS ===');

// Career mapping helper
function mapearCarrera(prog) {
    if (!prog) return 'Sin Asignar (Pendiente)';
    const p = prog.toUpperCase().trim();
    if (p.includes('COMPUTACION')) return 'Computación e Informática';
    if (p.includes('CORTE') || p.includes('ENSAMBL')) return 'Corte y Ensamblaje';
    if (p.includes('PELUQUERIA') || p.includes('BARBERIA')) return 'Peluquería y Barbería';
    if (p.includes('MOTOS')) return 'Mecánica de Motos';
    if (p.includes('AUTOMOTORIZ')) return 'Mecánica Automotriz';
    if (p.includes('ELECTRONICA')) return 'Electricidad y Electrónica';
    if (p.includes('CARPINTERIA')) return 'Carpintería Metálica';
    return 'Sin Asignar (Pendiente)';
}

// Group mapping helper
function mapearGrupo(carrera, turno) {
    const t = (turno || '').toUpperCase().trim();
    let turnoOficial = 'Turno Mañana';
    if (t.includes('TARDE')) turnoOficial = 'Turno Tarde';
    else if (t.includes('NOCHE')) turnoOficial = 'Turno Noche';
    else if (t.includes('VIRTUAL')) turnoOficial = 'Turno Virtual';
    else if (t.includes('SABADO')) turnoOficial = 'Turno Sábado';

    if (carrera === 'Computación e Informática') return `Computación e Informática - ${turnoOficial}`;
    if (carrera === 'Corte y Ensamblaje') return `Corte y Ensamblaje - ${turnoOficial}`;
    if (carrera === 'Peluquería y Barbería') return `Peluquería y Barbería - ${turnoOficial}`;
    if (carrera === 'Mecánica de Motos') return 'Mecánica de Motos - Turno Mañana';
    if (carrera === 'Mecánica Automotriz') return 'Mecánica Automotriz - Turno Tarde';
    if (carrera === 'Electricidad y Electrónica') return 'Electricidad y Electrónica - Turno Tarde';
    if (carrera === 'Carpintería Metálica') return 'Carpintería Metálica - Turno Tarde';
    return 'Sin Asignar (Pendiente)';
}

// Encargado mapping helper
const docentes = db.prepare('SELECT nombre, carrera FROM docentes').all();
function obtenerEncargado(carrera, grupo) {
    if (carrera === 'Computación e Informática') return 'Magda Chura Coaquipa';
    if (carrera === 'Corte y Ensamblaje') return 'Eloy Valerio Paredes Feliciano';
    if (carrera === 'Peluquería y Barbería') return 'María Azucena Ccolla Villanueva';
    if (carrera === 'Mecánica de Motos') return 'Aníbal Bruno Maquera Gil';
    if (carrera === 'Mecánica Automotriz') return 'Aníbal Bruno Maquera Gil';
    if (carrera === 'Electricidad y Electrónica') return 'Teófilo Larico Canahuire';
    if (carrera === 'Carpintería Metálica') return 'Cesáreo Julio Ccosi Quenaya';
    return 'Eloy Valerio Paredes Feliciano';
}

// Normalizar nombre de estudiante
function normalizarNombre(nom) {
    if (!nom) return null;
    let n = nom.trim();
    if (n === 'ANULADO' || n === 'NO EXISTE BOLETA') return n;
    // Si viene "APELLIDOS, Nombres" convertir o mantener estándar
    // En el padrón actual de estudiantes se usó "Nombres Apellidos" o "APELLIDOS, Nombres"?
    return n;
}

const dbMovs = db.prepare('SELECT * FROM movimientos').all();
const dbByComp = new Map();
dbMovs.forEach(m => {
    const num = parseInt(m.comprobante, 10);
    if (!isNaN(num)) dbByComp.set(num, m);
});

console.log('Recibos a insertar o actualizar:');
let insertCount = 0;
let updateCount = 0;
let naCount = 0;

json.forEach(j => {
    const num = parseInt(j.numero_recibo, 10);
    const fecha = (!j.fecha || String(j.fecha).trim() === '' || j.fecha === 'null') ? 'N/A' : String(j.fecha).trim();
    if (fecha === 'N/A') naCount++;

    if (dbByComp.has(num)) {
        updateCount++;
    } else {
        insertCount++;
    }
});

console.log('Total a actualizar (existentes 601 a 810):', updateCount);
console.log('Total a insertar (nuevos 811 a 841):', insertCount);
console.log('Total registros con fecha N/A:', naCount);

db.close();
