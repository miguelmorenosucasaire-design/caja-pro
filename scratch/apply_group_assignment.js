const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('=== POPULATING OFFICIAL GROUPS AND ASSIGNING STUDENTS ===');

const gruposOficiales = [
    {
        nombre: 'Computación e Informática - Turno Tarde',
        carrera: 'Computación e Informática',
        encargado: 'CHURA COAQUIPA, Magda',
        turno: 'Tarde',
        horario: 'Lun - Vie 14:00 - 18:00',
        aula_taller: 'Laboratorio de Cómputo 1',
        descripcion: 'Ofimática profesional, diseño y soporte técnico'
    },
    {
        nombre: 'Computación e Informática - Turno Virtual',
        carrera: 'Computación e Informática',
        encargado: 'CHURA COAQUIPA, Magda',
        turno: 'Virtual',
        horario: 'Modalidad Virtual / Plataforma',
        aula_taller: 'Aula Virtual CETPRO',
        descripcion: 'Plataformas digitales, gestión y ofimática virtual'
    },
    {
        nombre: 'Computación e Informática - Turno Mañana',
        carrera: 'Computación e Informática',
        encargado: 'CHURA COAQUIPA, Magda',
        turno: 'Mañana',
        horario: 'Lun - Vie 08:00 - 13:00',
        aula_taller: 'Laboratorio de Cómputo 1',
        descripcion: 'Módulos de computación e informática básica y avanzada'
    },
    {
        nombre: 'Computación e Informática - Turno Sábado',
        carrera: 'Computación e Informática',
        encargado: 'CHURA COAQUIPA, Magda',
        turno: 'Sábado',
        horario: 'Sábados 08:00 - 17:00',
        aula_taller: 'Laboratorio de Cómputo 2',
        descripcion: 'Programa intensivo sabatino de computación'
    },
    {
        nombre: 'Corte y Ensamblaje - Turno Mañana',
        carrera: 'Corte y Ensamblaje',
        encargado: 'FLORES LLANO, Liz Elvira',
        turno: 'Mañana',
        horario: 'Lun - Vie 08:00 - 13:00',
        aula_taller: 'Taller de Confección Textil 1',
        descripcion: 'Módulo I: Trazado, tendido y confección de prendas'
    },
    {
        nombre: 'Corte y Ensamblaje - Turno Tarde',
        carrera: 'Corte y Ensamblaje',
        encargado: 'CHURA MAMANI, René Prudencio',
        turno: 'Tarde',
        horario: 'Lun - Vie 14:00 - 18:00',
        aula_taller: 'Taller de Confección Textil 2',
        descripcion: 'Módulo I y II: Operatividad de máquinas y confección industrial'
    },
    {
        nombre: 'Corte y Ensamblaje - Turno Noche',
        carrera: 'Corte y Ensamblaje',
        encargado: 'LARICO CANAHUIRE, Teófilo',
        turno: 'Noche',
        horario: 'Lun - Vie 18:30 - 21:30',
        aula_taller: 'Taller de Confección Textil 1',
        descripcion: 'Patronaje industrial y confección avanzada'
    },
    {
        nombre: 'Peluquería y Barbería - Turno Mañana',
        carrera: 'Peluquería y Barbería',
        encargado: 'AYNA CABRERA, Alejandrina',
        turno: 'Mañana',
        horario: 'Lun - Vie 08:00 - 13:00',
        aula_taller: 'Taller de Cosmetología y Barbería',
        descripcion: 'Corte de cabello, peinados y tratamientos capilares'
    },
    {
        nombre: 'Peluquería y Barbería - Turno Tarde',
        carrera: 'Peluquería y Barbería',
        encargado: 'CCOLLA VILLANUEVA, María Azucena',
        turno: 'Tarde',
        horario: 'Lun - Vie 14:00 - 18:00',
        aula_taller: 'Taller de Cosmetología y Barbería',
        descripcion: 'Colorimetría, ondulación y barbería moderna'
    },
    {
        nombre: 'Peluquería y Barbería - Turno Noche',
        carrera: 'Peluquería y Barbería',
        encargado: 'GUTIERREZ LOZA, Fidela',
        turno: 'Noche',
        horario: 'Lun - Vie 18:30 - 21:30',
        aula_taller: 'Taller de Cosmetología y Barbería',
        descripcion: 'Barbería profesional y estilismo capilar'
    },
    {
        nombre: 'Mecánica de Motos - Turno Mañana',
        carrera: 'Mecánica de Motos',
        encargado: 'MAQUERA GIL, Aníbal Bruno',
        turno: 'Mañana',
        horario: 'Lun - Vie 08:00 - 13:00',
        aula_taller: 'Taller de Mecánica de Motos y Afines',
        descripcion: 'Mantenimiento preventivo, correctivo y sistemas de inyección'
    },
    {
        nombre: 'Mecánica Automotriz - Turno Tarde',
        carrera: 'Mecánica Automotriz',
        encargado: 'VELASQUEZ VILCA, Edgar',
        turno: 'Tarde',
        horario: 'Lun - Vie 14:00 - 18:00',
        aula_taller: 'Taller de Mecánica Automotriz',
        descripcion: 'Motores de combustión interna, transmisiones y frenos'
    },
    {
        nombre: 'Electricidad y Electrónica - Turno Tarde',
        carrera: 'Electricidad y Electrónica',
        encargado: 'HUANCA CASTRO, Serafín',
        turno: 'Tarde',
        horario: 'Lun - Vie 14:00 - 18:00',
        aula_taller: 'Taller de Electricidad y Electrónica',
        descripcion: 'Instalaciones eléctricas residenciales y circuitos electrónicos'
    },
    {
        nombre: 'Carpintería Metálica - Turno Tarde',
        carrera: 'Carpintería Metálica',
        encargado: 'CCOSI QUENAYA, Cesáreo Julio',
        turno: 'Tarde',
        horario: 'Lun - Vie 14:00 - 18:00',
        aula_taller: 'Taller de Soldadura y Carpintería Metálica',
        descripcion: 'Soldadura eléctrica por arco y carpintería metálica'
    },
    {
        nombre: 'Sin Asignar (Pendiente)',
        carrera: 'Sin Asignar (Pendiente)',
        encargado: 'PAREDES FELICIANO, Eloy Valerio',
        turno: 'Mañana',
        horario: 'Pendiente de asignación',
        aula_taller: 'Dirección / Secretaría',
        descripcion: 'Estudiantes pendientes de asignación de carrera'
    }
];

// Clean and insert into grupos
db.exec("DELETE FROM grupos");
const insertGrupoStmt = db.prepare(`
    INSERT INTO grupos (nombre, carrera, encargado, turno, horario, aula_taller, descripcion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

gruposOficiales.forEach(g => {
    insertGrupoStmt.run(g.nombre, g.carrera, g.encargado, g.turno, g.horario, g.aula_taller, g.descripcion);
});

console.log(`Inserted ${gruposOficiales.length} official groups.`);

// Function to determine group name
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

// Normalize turnos in estudiantes
function normalizeTurno(t) {
    const s = (t || '').trim().toLowerCase();
    if (s.includes('virtual')) return 'Virtual';
    if (s.includes('sabado') || s.includes('sábado')) return 'Sábado';
    if (s.includes('tarde')) return 'Tarde';
    if (s.includes('noche')) return 'Noche';
    return 'Mañana';
}

const updateEstStmt = db.prepare(`UPDATE estudiantes SET grupo = ?, turno = ? WHERE id = ?`);
const updateMovStmt = db.prepare(`UPDATE movimientos SET grupo = ?, turno = ? WHERE id = ?`);

const ests = db.prepare('SELECT id, carrera, turno FROM estudiantes').all();
ests.forEach(e => {
    const grp = getGrupoName(e.carrera, e.turno);
    const tNorm = normalizeTurno(e.turno);
    updateEstStmt.run(grp, tNorm, e.id);
});

const movs = db.prepare('SELECT id, carrera, turno FROM movimientos').all();
movs.forEach(m => {
    const grp = getGrupoName(m.carrera, m.turno);
    const tNorm = normalizeTurno(m.turno);
    updateMovStmt.run(grp, tNorm, m.id);
});

console.log('Students and movements updated with group names and normalized turnos.');

// Verify
const summary = db.prepare(`
    SELECT g.nombre, g.encargado, g.turno,
           (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as total_alumnos,
           (SELECT COALESCE(SUM(m.monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo = 'Ingreso' AND m.estado = 'Pagado') as total_ingresos
    FROM grupos g
    ORDER BY g.carrera ASC, g.nombre ASC
`).all();

console.table(summary);
console.log('Total students assigned:', db.prepare('SELECT count(*) as c FROM estudiantes WHERE grupo != "General"').get().c);
console.log('Total movements assigned:', db.prepare('SELECT count(*) as c FROM movimientos WHERE grupo != "General"').get().c);
