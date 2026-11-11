const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

console.log('--- MIGRANDO A LOS 7 PROGRAMAS OFICIALES Y 13 GRUPOS ---');

// 1. Docentes oficiales (7 docentes para los 7 programas del folleto)
const docentesOficiales = [
    { nombre: 'Teresa Aguilar Gómez', carrera: 'Corte y Ensamblaje', especialidad: 'Trazado, tendido y confección de prendas', telefono: '951-234567', email: 'taguilar@cetpro.edu.pe' },
    { nombre: 'Lucía Fernanda Paredes Soto', carrera: 'Peluquería y Barbería', especialidad: 'Corte de cabello, barbería y colorimetría', telefono: '951-345678', email: 'lparedes@cetpro.edu.pe' },
    { nombre: 'Rosa Elena Quispe Huamán', carrera: 'Computación e Informática', especialidad: 'Ofimática, diseño gráfico y plataformas', telefono: '951-456789', email: 'rquispe@cetpro.edu.pe' },
    { nombre: 'Carlos Alberto Mendoza Ríos', carrera: 'Mantenimiento de Sistemas Eléctricos', especialidad: 'Instalaciones eléctricas y domótica', telefono: '951-567890', email: 'cmendoza@cetpro.edu.pe' },
    { nombre: 'Miguel Ángel Torres Cárdenas', carrera: 'Mecánica Automotriz', especialidad: 'Motores de combustión y transmisiones', telefono: '951-678901', email: 'mtorres@cetpro.edu.pe' },
    { nombre: 'Jorge Luis Huamán Ramos', carrera: 'Mecánica de Motos y Vehículo Afines', especialidad: 'Sistemas electrónicos de motos y GNV-GLP', telefono: '951-789012', email: 'jhuaman@cetpro.edu.pe' },
    { nombre: 'Walter Mamani Condori', carrera: 'Carpintería Metálica', especialidad: 'Soldadura TIG-MIG-MAG y arco eléctrico', telefono: '951-890123', email: 'wmamani@cetpro.edu.pe' }
];

// Actualizar o insertar docentes
docentesOficiales.forEach(d => {
    const existing = db.prepare("SELECT id FROM docentes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").get(d.nombre);
    if (existing) {
        db.prepare(`
            UPDATE docentes 
            SET carrera = ?, especialidad = ?, telefono = ?, email = ?
            WHERE id = ?
        `).run(d.carrera, d.especialidad, d.telefono, d.email, existing.id);
    } else {
        db.prepare(`
            INSERT INTO docentes (nombre, carrera, especialidad, telefono, email, tipo_contrato)
            VALUES (?, ?, ?, ?, ?, 'Tiempo Completo')
        `).run(d.nombre, d.carrera, d.especialidad, d.telefono, d.email);
    }
});

// 2. Definición de los 13 grupos oficiales
const treceGrupos = [
    // 3 Grupos de Corte y Ensamblaje
    {
        nombre: 'Corte y Ensamblaje - Turno Mañana (Grupo A)',
        carrera: 'Corte y Ensamblaje',
        encargado: 'Teresa Aguilar Gómez',
        turno: 'Mañana',
        horario: 'Lun-Mié-Vie 8:00 - 13:00',
        aula_taller: 'Taller de Confección 1',
        descripcion: 'Módulo I: Técnicas de trazado, tendido y corte de prendas de vestir',
        mapFrom: 'Corte y Confección - Grupo A'
    },
    {
        nombre: 'Corte y Ensamblaje - Turno Tarde (Grupo B)',
        carrera: 'Corte y Ensamblaje',
        encargado: 'Teresa Aguilar Gómez',
        turno: 'Tarde',
        horario: 'Lun-Mié-Vie 14:00 - 18:00',
        aula_taller: 'Taller de Confección 2',
        descripcion: 'Módulo II: Técnicas de confección de prendas de vestir',
        mapFrom: null
    },
    {
        nombre: 'Corte y Ensamblaje - Turno Noche / Fin de Semana (Grupo C)',
        carrera: 'Corte y Ensamblaje',
        encargado: 'Teresa Aguilar Gómez',
        turno: 'Noche',
        horario: 'L - V 18:30 - 21:30 y S/D',
        aula_taller: 'Taller de Confección 1',
        descripcion: 'Módulo I y II: Confección industrial y patronaje',
        mapFrom: null
    },

    // 3 Grupos de Peluquería y Barbería
    {
        nombre: 'Peluquería y Barbería - Turno Mañana (Grupo A)',
        carrera: 'Peluquería y Barbería',
        encargado: 'Lucía Fernanda Paredes Soto',
        turno: 'Mañana',
        horario: 'Lun-Mié-Vie 8:00 - 13:00',
        aula_taller: 'Taller de Estética y Barbería',
        descripcion: 'Módulo I: Corte de cabellos, peinados y diseño de barbas',
        mapFrom: 'Cosmetología - Grupo A'
    },
    {
        nombre: 'Peluquería y Barbería - Turno Tarde (Grupo B)',
        carrera: 'Peluquería y Barbería',
        encargado: 'Lucía Fernanda Paredes Soto',
        turno: 'Tarde',
        horario: 'Lun-Mié-Vie 14:00 - 18:00',
        aula_taller: 'Taller de Estética y Barbería',
        descripcion: 'Módulo II: Ondulación, decoloración y tinturación',
        mapFrom: 'Gastronomía y Repostería - Grupo A' // Reasignamos suavemente manteniendo alumnos y pagos
    },
    {
        nombre: 'Peluquería y Barbería - Turno Noche / Fin de Semana (Grupo C)',
        carrera: 'Peluquería y Barbería',
        encargado: 'Lucía Fernanda Paredes Soto',
        turno: 'Noche',
        horario: 'L - V 18:30 - 21:30 y S/D',
        aula_taller: 'Taller de Estética y Barbería',
        descripcion: 'Módulo I: Tratamientos capilares y barbería moderna',
        mapFrom: null
    },

    // 2 Grupos de Computación e Informática
    {
        nombre: 'Computación e Informática - Turno Mañana (Grupo A)',
        carrera: 'Computación e Informática',
        encargado: 'Rosa Elena Quispe Huamán',
        turno: 'Mañana',
        horario: 'Lun-Mié-Vie 8:00 - 12:00',
        aula_taller: 'Laboratorio de Cómputo 1',
        descripcion: 'Módulo I: Ofimática y productividad digital',
        mapFrom: 'Computación e Informática - Grupo A'
    },
    {
        nombre: 'Computación e Informática - Turno Noche (Grupo B)',
        carrera: 'Computación e Informática',
        encargado: 'Rosa Elena Quispe Huamán',
        turno: 'Noche',
        horario: 'Lun-Mié-Vie 18:00 - 21:00',
        aula_taller: 'Laboratorio de Cómputo 2',
        descripcion: 'Módulo II: Diseño gráfico y plataformas digitales',
        mapFrom: null
    },

    // 2 Grupos de Mecánica Automotriz
    {
        nombre: 'Mecánica Automotriz - Turno Mañana (Grupo A)',
        carrera: 'Mecánica Automotriz',
        encargado: 'Miguel Ángel Torres Cárdenas',
        turno: 'Mañana',
        horario: 'Lun-Mié-Vie 8:00 - 13:00',
        aula_taller: 'Taller de Mecánica Automotriz',
        descripcion: 'Módulo I: Suspensión, dirección, frenos y transmisión',
        mapFrom: 'Mecánica Automotriz - Grupo A'
    },
    {
        nombre: 'Mecánica Automotriz - Turno Sábado y Domingo (Grupo B)',
        carrera: 'Mecánica Automotriz',
        encargado: 'Miguel Ángel Torres Cárdenas',
        turno: 'Sábado y Domingo',
        horario: 'Sáb-Dom 8:00 - 17:00',
        aula_taller: 'Taller de Mecánica Automotriz',
        descripcion: 'Módulo II: Motores de combustión interna y diagnóstico',
        mapFrom: null
    },

    // 1 Grupo de Mecánica de Motos y Vehículo Afines
    {
        nombre: 'Mecánica de Motos y Vehículos Afines - Turno Mañana (Grupo A)',
        carrera: 'Mecánica de Motos y Vehículo Afines',
        encargado: 'Jorge Luis Huamán Ramos',
        turno: 'Mañana',
        horario: 'Lun-Mié-Vie 8:00 - 13:00',
        aula_taller: 'Taller de Motos y Afines',
        descripcion: 'Módulo I: Mantenimiento y reparación de motos y afines',
        mapFrom: null
    },

    // 1 Grupo de Carpintería Metálica
    {
        nombre: 'Carpintería Metálica - Turno Tarde (Grupo A)',
        carrera: 'Carpintería Metálica',
        encargado: 'Walter Mamani Condori',
        turno: 'Tarde',
        horario: 'Mar-Jue-Sáb 14:00 - 18:00',
        aula_taller: 'Taller de Soldadura y Carpintería Metálica',
        descripcion: 'Módulo I: Soldadura por arco eléctrico en acero',
        mapFrom: null
    },

    // 1 Grupo de Mantenimiento de Sistemas Eléctricos
    {
        nombre: 'Mantenimiento de Sistemas Eléctricos - Turno Tarde (Grupo A)',
        carrera: 'Mantenimiento de Sistemas Eléctricos',
        encargado: 'Carlos Alberto Mendoza Ríos',
        turno: 'Tarde',
        horario: 'Mar-Jue 14:00 - 18:00',
        aula_taller: 'Taller de Electricidad y Domótica',
        descripcion: 'Módulo I: Instalación de sistemas eléctricos en edificaciones',
        mapFrom: 'Electricidad Domiciliaria - Grupo A'
    }
];

// Aplicar mapeo y creación de grupos
treceGrupos.forEach((g, idx) => {
    // Si tiene mapFrom, actualizar el grupo existente
    if (g.mapFrom) {
        const exist = db.prepare("SELECT id FROM grupos WHERE nombre = ?").get(g.mapFrom);
        if (exist) {
            db.prepare(`
                UPDATE grupos 
                SET nombre = ?, carrera = ?, encargado = ?, turno = ?, horario = ?, aula_taller = ?, descripcion = ?
                WHERE id = ?
            `).run(g.nombre, g.carrera, g.encargado, g.turno, g.horario, g.aula_taller, g.descripcion, exist.id);

            // Actualizar estudiantes y movimientos
            db.prepare("UPDATE estudiantes SET grupo = ?, carrera = ? WHERE grupo = ?").run(g.nombre, g.carrera, g.mapFrom);
            db.prepare("UPDATE movimientos SET grupo = ?, carrera = ?, encargado = ? WHERE grupo = ?").run(g.nombre, g.carrera, g.encargado, g.mapFrom);
            console.log(`[+] Grupo #${exist.id} actualizado a: ${g.nombre}`);
            return;
        }
    }

    // Verificar si ya existe con el nombre nuevo
    const existNew = db.prepare("SELECT id FROM grupos WHERE nombre = ?").get(g.nombre);
    if (existNew) {
        db.prepare(`
            UPDATE grupos 
            SET carrera = ?, encargado = ?, turno = ?, horario = ?, aula_taller = ?, descripcion = ?
            WHERE id = ?
        `).run(g.carrera, g.encargado, g.turno, g.horario, g.aula_taller, g.descripcion, existNew.id);
        console.log(`[+] Grupo #${existNew.id} refrescado: ${g.nombre}`);
    } else {
        const info = db.prepare(`
            INSERT INTO grupos (nombre, carrera, encargado, turno, horario, aula_taller, descripcion)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(g.nombre, g.carrera, g.encargado, g.turno, g.horario, g.aula_taller, g.descripcion);
        console.log(`[+] Creado Grupo #${info.lastInsertRowid}: ${g.nombre}`);
    }
});

const totalGrupos = db.prepare("SELECT COUNT(*) as c FROM grupos").get().c;
const totalDocentes = db.prepare("SELECT COUNT(*) as c FROM docentes").get().c;
console.log(`\n======================================================`);
console.log(`TOTAL GRUPOS EN BD: ${totalGrupos} | TOTAL DOCENTES: ${totalDocentes}`);
console.log(`======================================================`);
