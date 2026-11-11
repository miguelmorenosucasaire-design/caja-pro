const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('Testing group assignment logic...');

function getGrupoName(carrera, turno) {
    const c = (carrera || '').trim();
    const t = (turno || '').trim().toLowerCase();

    if (c === 'Sin Asignar (Pendiente)' || !c || c === 'Sin Asignar') {
        return 'Sin Asignar (Pendiente)';
    }

    if (c === 'Computación e Informática') {
        if (t.includes('virtual')) return 'Computación e Informática - Turno Virtual';
        if (t.includes('sabado') || t.includes('sábado')) return 'Computación e Informática - Turno Sábado';
        if (t.includes('tarde')) return 'Computación e Informática - Turno Tarde';
        return 'Computación e Informática - Turno Mañana';
    }

    if (c === 'Corte y Ensamblaje') {
        if (t.includes('tarde')) return 'Corte y Ensamblaje - Turno Tarde';
        if (t.includes('noche')) return 'Corte y Ensamblaje - Turno Noche';
        return 'Corte y Ensamblaje - Turno Mañana';
    }

    if (c === 'Peluquería y Barbería') {
        if (t.includes('tarde')) return 'Peluquería y Barbería - Turno Tarde';
        if (t.includes('noche')) return 'Peluquería y Barbería - Turno Noche';
        return 'Peluquería y Barbería - Turno Mañana';
    }

    if (c === 'Mecánica de Motos') {
        return 'Mecánica de Motos - Turno Mañana';
    }

    if (c === 'Mecánica Automotriz') {
        return 'Mecánica Automotriz - Turno Tarde';
    }

    if (c === 'Electricidad y Electrónica') {
        return 'Electricidad y Electrónica - Turno Tarde';
    }

    if (c === 'Carpintería Metálica') {
        return 'Carpintería Metálica - Turno Tarde';
    }

    return `${c} - General`;
}

const ests = db.prepare('SELECT id, nombre, carrera, turno FROM estudiantes').all();
const counts = {};
ests.forEach(e => {
    const g = getGrupoName(e.carrera, e.turno);
    counts[g] = (counts[g] || 0) + 1;
});

console.log('Students per group:');
console.table(counts);

let total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('Total students mapped:', total);
