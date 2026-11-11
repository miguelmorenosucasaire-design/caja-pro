const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Check financial total before
const revBefore = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo = 'Ingreso'").get().s;
const estBefore = db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c;
const movBefore = db.prepare("SELECT COUNT(*) as c FROM movimientos").get().c;

console.log('Before update:');
console.log('Revenue:', revBefore);
console.log('Students:', estBefore);
console.log('Movements:', movBefore);

// Check if turno / cargo columns exist in docentes
const tableInfo = db.prepare("PRAGMA table_info(docentes)").all();
const hasTurno = tableInfo.some(c => c.name === 'turno');
const hasCargo = tableInfo.some(c => c.name === 'cargo');

if (!hasTurno) {
    db.prepare("ALTER TABLE docentes ADD COLUMN turno TEXT DEFAULT 'Mañana'").run();
    console.log('[+] Added column turno to docentes');
}
if (!hasCargo) {
    db.prepare("ALTER TABLE docentes ADD COLUMN cargo TEXT DEFAULT 'Docente'").run();
    console.log('[+] Added column cargo to docentes');
}

const docentesOficiales = [
    {
        nombre: 'PAREDES FELICIANO, Eloy Valerio',
        cargo: 'DIRECTOR',
        carrera: 'Dirección Institucional',
        turno: 'Mañana - Tarde',
        especialidad: 'Dirección y Gestión Educativa',
        email: 'eparedes@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'MAQUERA GIL, Aníbal Bruno',
        cargo: 'Docente',
        carrera: 'Mecánica de Motos',
        turno: 'Mañana',
        especialidad: 'Sistema Eléctrico y Mecánica de Motos',
        email: 'amaquera@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'AYNA CABRERA, Alejandrina',
        cargo: 'Docente',
        carrera: 'Peluquería y Barbería',
        turno: 'Mañana',
        especialidad: 'Decoloración y Técnicas de Barbería',
        email: 'aayna@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'FLORES LLANO, Liz Elvira',
        cargo: 'Docente',
        carrera: 'Corte y Ensamblaje',
        turno: 'Mañana',
        especialidad: 'Corte, Confección y Ondulación',
        email: 'lflores@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'CHURA MAMANI, René Prudencio',
        cargo: 'Docente',
        carrera: 'Corte y Ensamblaje',
        turno: 'Tarde',
        especialidad: 'Trazado, Corte y Ensamblaje Textil',
        email: 'rchura@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'CCOLLA VILLANUEVA, María Azucena',
        cargo: 'Docente',
        carrera: 'Peluquería y Barbería',
        turno: 'Tarde',
        especialidad: 'Decoloración Técnica y Estilismo',
        email: 'mccolla@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'CCOSI QUENAYA, Cesáreo Julio',
        cargo: 'Docente',
        carrera: 'Carpintería Metálica',
        turno: 'Tarde',
        especialidad: 'Prácticas de Soldadura y Estructuras',
        email: 'cccosi@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'VELASQUEZ VILCA, Edgar',
        cargo: 'Docente',
        carrera: 'Mecánica Automotriz',
        turno: 'Tarde',
        especialidad: 'Sistema de Encendido y Motores',
        email: 'evelasquez@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'HUANCA CASTRO, Serafín',
        cargo: 'Docente',
        carrera: 'Electricidad y Electrónica',
        turno: 'Noche',
        especialidad: 'Instalaciones Eléctricas y Equipos',
        email: 'shuanca@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'CHURA COAQUIPA, Magda',
        cargo: 'Docente',
        carrera: 'Computación e Informática',
        turno: 'Noche',
        especialidad: 'Diseño Gráfico (Photoshop) y Ofimática',
        email: 'mchura@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'LARICO CANAHUIRE, Teófilo',
        cargo: 'Docente',
        carrera: 'Corte y Ensamblaje',
        turno: 'Noche',
        especialidad: 'Confección Industrial y Ensamblaje',
        email: 'tlarico@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'GUTIERREZ LOZA, Fidela',
        cargo: 'Docente',
        carrera: 'Peluquería y Barbería',
        turno: 'Noche',
        especialidad: 'Tratamientos Capilares y Barbería',
        email: 'fgutierrez@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'VILCA PUMA, Carmen Y.',
        cargo: 'Secretaria',
        carrera: 'Administración y Secretaría',
        turno: 'Mañana - Tarde',
        especialidad: 'Atención al Usuario y Trámite Documentario',
        email: 'cvilca@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'CANAZA ZAPATA, Néstor',
        cargo: 'Personal de Servicio',
        carrera: 'Mantenimiento y Servicios',
        turno: 'Mañana - Tarde',
        especialidad: 'Apoyo Operativo y Mantenimiento',
        email: 'ncanaza@cetpro.edu.pe',
        telefono: ''
    },
    {
        nombre: 'PASTOR MURRIEL, Víctor Antonio',
        cargo: 'Personal de Servicio',
        carrera: 'Mantenimiento y Servicios',
        turno: 'Noche',
        especialidad: 'Limpieza y Servicios Generales',
        email: 'vpastor@cetpro.edu.pe',
        telefono: ''
    }
];

// Clean old mock docentes
db.prepare("DELETE FROM docentes").run();

const insertStmt = db.prepare(`
    INSERT INTO docentes (nombre, cargo, carrera, turno, especialidad, email, telefono, tipo_contrato)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Tiempo Completo')
`);

for (const d of docentesOficiales) {
    insertStmt.run(d.nombre, d.cargo, d.carrera, d.turno, d.especialidad, d.email, d.telefono);
}

const list = db.prepare("SELECT id, nombre, cargo, carrera, turno FROM docentes ORDER BY id ASC").all();
console.log('Docentes oficiales registrados:', list.length);
console.log(list);

// Check financial total after
const revAfter = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo = 'Ingreso'").get().s;
const estAfter = db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c;
const movAfter = db.prepare("SELECT COUNT(*) as c FROM movimientos").get().c;

console.log('After update:');
console.log('Revenue:', revAfter, 'Match:', revBefore === revAfter);
console.log('Students:', estAfter, 'Match:', estBefore === estAfter);
console.log('Movements:', movAfter, 'Match:', movBefore === movAfter);
